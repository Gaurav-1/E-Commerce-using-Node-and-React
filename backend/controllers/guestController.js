const { v4: uuid } = require('uuid')
const nodemailer = require('nodemailer')
const { generateToken, verifyToken } = require('../utils/tokenHandler')
const {
    search,
    insert,
    update,
} = require('../database/queries')


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
            let token = generateToken({id},'10m')
            let isMailSent = await verificationMail({token, email: req.body.email, name: req.body.name })
            // console.log('Is Mail Sent: ', isMailSent);

            //-- if messageId is found inside the object recived in isMailSent then success -----------------------
            if (isMailSent?.messageId)
                res.status(200).json({ message: 'Signup Done. Verification mail has been sent to your mail.' })
            else
                res.status(200).json({ message: `Signup Done but verification mail can't be sent. Go to send verification mail link` })
        }
        else
            res.status(500).json({ error: 'Singup failed due to server error' })

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

async function VerfyGuest(req,res){
    try {
        if(!req?.query?.token){
            res.status(404).json({error: 'Token not found please regenrate the link.'})
            return
        }

        let token = await verifyToken(req.query.token)
        // console.log(token);
        let updateObj = {
            table: 'users',
            set: 'isVerified=1',
            where: `id = '${token.id}'`
        }

        let isVerified = await update(updateObj)
        // console.log(isVerified);
        if(isVerified.changedRows)
            res.status(200).json({message: 'Verification Completed. Please enjoy shopping.'})
        else
            res.status(401).json({error: 'Verification Failed. Please regenerate the link'})
    } catch (error) {
        console.log('VerifyGuest() Error: ',error);
        res.status(500).json({error: 'An error occured on the server side.'})
    }
}

module.exports = {
    SignupUser,
    VerfyGuest,
}