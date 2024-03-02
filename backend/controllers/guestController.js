const { v4: uuid } = require('uuid')
const nodemailer = require('nodemailer')
const { generateToken, verifyToken } = require('../utils/tokenHandler')
const {
    search,
    insert,
    update,
} = require('../database/queries')

//-- searchObj = { columns: 'columns names' || ['with functions','or multiple columns'], table: 'table name', where: 'where condition' } --------
//-- insertObj = { table: 'table name', values: [values] } ----------------------
//-- updateObj = { table: 'table name', set: 'columns = values', where: 'where condition' }

async function SignupUser(req, res) {
    try {
        // console.log(req.body);
        //-- body is required ----------------------
        if (req.body == '') {
            res.status(404).json({ error: 'Information not recived' })
            return
        }

        //-- search object to find if user Exists or not --------------------------------
        let searchObj = {
            columns: ['COUNT(mail) AS isExists'],
            table: 'users',
            where: `mail = '${req.body.email}'`
        }

        //-- search query is requested -------------------------------------
        let user = await search(searchObj)
        // console.log('Returend: ',user[0].mail);
        //-- if isExists > 0 means user already exists can't make a new one -----------------------
        if (user[0].isExists > 0) {
            res.status(409).json({ error: 'User Already Exists' })
            return
        }

        //-- values object to insert into the table ----------------------------------------
        let id = uuid()
        let insertObj = {
            table: 'users',
            values: [id, req.body.name, req.body.email, req.body.password, 0, 'user', null, null]
        }

        //-- insert query is requested ---------------------------------------
        let isInserted = await insert(insertObj)
        // console.log(isInserted)
        //-- an object with affectedRows: 1 return when data is inserted ----------------------------
        if (isInserted.affectedRows == 1) {
            let token = generateToken({ id }, '10m')
            let isMailSent = await verificationMail({ token, email: req.body.email, name: req.body.name })
            // console.log('Is Mail Sent: ', isMailSent);

            //-- when mail sent successfully it will retrun an messageId -----------------------
            if (isMailSent?.messageId)
                res.status(200).json({ message: 'Signup Done. Verification mail has been sent to your mail.' })
            else
                res.status(200).json({ message: `Signup Done but verification mail can't be sent. Go to send verification mail link` })
        }
        else
            res.status(500).json({ error: 'Singup failed due to server side error' })

    } catch (error) {
        console.log('SignupUser() ERROR: ', error);
        res.status(500).send('An error occured at the server side')
    }
}

async function verificationMail(params) {
    return new Promise(async (resolve, reject) => {

        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAIL,
                    pass: process.env.MAILPASSWORD
                },
            });

            //-- this is content user will interact with in the mail -------------------
            let htmlContent = `<h1 style="font-family: sans-serif; text-align: center; background: purple; color: white; padding-block: 20px; border-radius: 10px;">Paridhana</h1>
            <div style="font-family: sans-serif;">
                <p>Thanks For becoming a member of paridhana family</p>
                <a style="border: none; background: purple; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin: 0 25px; width: fit-content; text-decoration: none; cursor: pointer;" href='http://localhost:3000/guest/verify?token=${params.token}' >Verify</a>
                <p>Shop here with no worries because we provide best quality product's for you.</p>
                <p>Please verify your mail by clicking the verify above.</p>
                <p>This verification link is valid for only 10 minutes.</p>
            </div>`

            //-- this is the mail content which define from which mail to which mail we need to send an email --------------------
            let mailContent = {
                from: process.env.MAIL,
                to: params.email,
                subject: 'Email verification for paridhana',
                text: 'Hello ' + params.name + ',',
                html: htmlContent
            }

            //-- this function will send the mail to user mail -------------------------
            transporter.sendMail(mailContent, (err, info) => {
                if (err)
                    reject(err)
                else
                    resolve(info) //-- return's an info object when successfully done -------------------
            })
        } catch (error) {
            console.log('verificationMail() ERROR: ', error);
            reject(error)
        }

    })
}

async function VerifyGuest(req, res) {
    try {
        //-- check token is available in req.query or not ----------------------------
        if (!req?.query?.token) {
            res.status(404).json({ error: 'Token not found please regenrate the link.' })
            return
        }

        //-- verify and decode the token ------------------------
        let token = await verifyToken(req.query.token)
        console.log(token);

        //-- create a update query object -----------------------
        let updateObj = {
            table: 'users',
            set: 'isVerified=1',
            where: `id = '${token.id}'`
        }

        let isVerified = await update(updateObj) //-- call update query --------------

        console.log(isVerified);
        if (isVerified.affectedRows)
            res.status(200).json({ message: 'Verification Completed. Please enjoy shopping.' })
        else
            res.status(401).json({ error: 'Verification Failed. Please regenerate the link' })

    } catch (error) {
        console.log('VerifyGuest() Error: ', error);
        res.status(500).json({ error: error.message })
    }
}

async function SendVerificationMail(req, res) {
    try {
        //-- search object to user -------------------
        let searchObj = {
            columns: ['id', 'name'],
            table: 'users',
            where: `mail = '${req.body.email}'`
        }
        let user = await search(searchObj) //-- call search query -------------------

        console.log(user[0]);
        if (!user || !user[0]?.id) {
            res.status(404).json({ error: 'user not found' })
            return
        }

        //-- build token containing user id with 10 minutes validation -----------------
        let token = await generateToken({ id: user[0].id }, '10m')

        //-- send verification mail --------------------------
        let isMailSent = await verificationMail({ token, email: req.body.email, name: user[0].name })

        //-- if mail is sent it will return an messageId ---------------------------
        if (isMailSent?.messageId)
            res.status(200).json({ message: 'Verification mail sent.' })
        else
            res.status(401).json({ error: 'Unable to send the verification mail.' })

    } catch (error) {
        console.log('SendVerificationMail() ERROR: ', error);
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    SignupUser,
    VerifyGuest,
    SendVerificationMail,
}