const { v4: uuid } = require('uuid')
const nodemailer = require('nodemailer')
const { generateToken, verifyToken } = require('../utils/tokenHandler')
const {
    search,
    insert,
    update,
} = require('../database/queries')

//-- searchObj = { columns: `columns`, table: 'table name', where: `where condition` } ---------------
//-- insertObj = { table: 'table name', values: [values] } ----------------------
//-- updateObj = { table: 'table name', set: `columns = values`, where: `where condition` } ----------

async function SignupUser(req, res) {
    try {
        // console.log(req.body);
        //-- body is required ----------------------
        if (!req?.body?.name || !req.body?.email || !req.body?.password) {
            res.status(404).json({ error: 'Signup credentials required.' })
            return
        }

        //-- search object to find if user Exists or not --------------------------------
        const email = req.body.email.toLowerCase().replace(/['"]/g, '\\$&')
        let searchObj = {
            columns: `COUNT(email) AS isExists`,
            table: 'users',
            where: `email = '${email}'`
        }//*******************

        //-- search query is requested -------------------------------------
        let user = await search(searchObj)
        // console.log('Returend: ',user[0].email);
        //-- if isExists > 0 means user already exists can't make a new one -----------------------
        if (user[0].isExists > 0) {
            res.status(409).json({ error: 'User Already Exists.' })
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
            let token = await generateToken({ id }, '10m')
            let isMailSent = await verificationMail({ token, email: req.body.email, name: req.body.name })
            // console.log('Is Mail Sent: ', isMailSent);

            //-- when email sent successfully it will retrun an messageId -----------------------
            if (isMailSent?.messageId)
                res.status(200).json({ message: 'Signup Done. Verification email has been sent to your email.' })
            else
                res.status(200).json({ message: `Signup Done but verification email can't be sent. Go to send verification email link.` })
        }
        else
            res.status(500).json({ error: 'Singup failed due to server side error.' })

    } catch (error) {
        console.log('SignupUser() ERROR: ', error);
        res.status(500).json({ errror: 'Server side error. Try again later.' })
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

            //-- this is content user will interact with in the email -------------------
            let htmlContent = params.htmlContent || `<h1 style="font-family: sans-serif; text-align: center; background: purple; color: white; padding-block: 20px; border-radius: 10px;">Paridhana</h1>
            <div style="font-family: sans-serif;">
                <p>Thanks for becoming a member of paridhana family</p>
                <a style="border: none; background: purple; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin: 0 25px; width: fit-content; text-decoration: none; cursor: pointer;" href='${process.env.REDIRECTPATH}/verify?token=${params.token}' >Verify</a>
                <p>Shop with us without worries because we provide best quality product's for you.</p>
                <p>Please verify your email by clicking the verify above.</p>
                <p>This verification link is valid for only 10 minutes.</p>
            </div>`

            //-- this is the email content which define from which email to which email we need to send an email --------------------
            let mailContent = {
                from: process.env.MAIL,
                to: params.email,
                subject: params.subject || 'Email verification for paridhana',
                text: 'Hello ' + params.name + ',',
                html: htmlContent
            }

            //-- this function will send the email to user email -------------------------
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

async function VerifyUser(req, res) {
    try {
        //-- check token is available in req.query or not ----------------------------
        if (!req?.query?.token) {
            res.status(404).json({ error: 'Token not found please regenrate the link.' })
            return
        }

        //-- verify and decode the token ------------------------
        let token = await verifyToken(req.query.token)
        // console.log(token);
        if (!token?.id) {
            res.status(401).json({ error: 'Invalid token' })
            return
        }

        //-- create a update query object -----------------------
        let updateObj = {
            table: 'users',
            set: 'isVerified = 1',
            where: `id = '${token.id}'`
        }

        let isUpdated = await update(updateObj) //-- call update query --------------
        // console.log(isUpdated);
        if (isUpdated.affectedRows)
            res.status(200).json({ message: 'Verification Completed. Please enjoy shopping.' })
        else
            res.status(401).json({ error: 'Verification Failed. Please regenerate the link.' })

    } catch (error) {
        console.log('VerifyGuest() Error: ', error);
        res.status(500).json({ error: 'Server side error try again later.' })
    }
}

async function SendVerificationMail(req, res) {
    try {
        if (!req?.body?.email) {
            res.status(409).json({ error: 'Email address is required.' })
            return
        }
        //-- search object to user -------------------
        let searchObj = {
            columns: `id, name`,
            table: 'users',
            where: `email = '${req.body.email}'`
        }
        let user = await search(searchObj) //-- call search query -------------------

        console.log(user[0]);
        if (!user || !user[0]?.id) {
            res.status(404).json({ error: 'user not found.' })
            return
        }

        //-- build token containing user id with 10 minutes validation -----------------
        let token = await generateToken({ id: user[0].id }, '10m')

        //-- send verification email --------------------------
        let isMailSent = await verificationMail({ token, email: req.body.email, name: user[0].name })

        //-- if email is sent it will return an messageId ---------------------------
        if (isMailSent?.messageId)
            res.status(200).json({ message: 'Verification email sent.' })
        else
            res.status(401).json({ error: 'Unable to send the verification email.' })

    } catch (error) {
        console.log('SendVerificationMail() ERROR: ', error);
        res.status(500).json({ error: 'Server side error try again later.' })
    }
}

async function Login(req, res) {
    try {
        if (!req?.body?.email || !req.body?.password) {
            res.status(409).json({ error: 'Login credentials required.' })
            return
        }

        //-- search object to find user -------------------
        const email = req.body.email.toLowerCase().replace(/['"]/g, '\\$&')
        const searchObj = {
            columns: `*`,
            table: 'users',
            where: `email = '${email}'`
        }
        //-- search for the user ------------------
        let user = await search(searchObj)
        // console.log('Users: ', user[0]);
        //-- if user not found -------------------------
        if (!user[0]?.id) {
            res.status(404).json({ error: 'User not exists.' })
            return
        }
        //-- if user not verified ----------------------
        if (user[0]?.isVerified == 0) {
            res.status(401).json({ error: 'Please verify your email first.' })
            return
        }
        //-- check password because MariaDB is not Case Sensitive ----------------------
        if (user[0]?.password !== req.body?.password) {
            res.status(401).json({ error: 'User Id or Password is not matched.' })
            return
        }
        //-- generate token for server side stateless authorization. Valid for 30 days ----------------------
        const token = await generateToken({ id: user[0].id, email: req.body.email, role: user[0].role })
        //-- object for client side authorization. Store in localStorage ------------------------------
        const auth = {
            name: user[0].name,
            role: user[0].role
        }
        res.status(200).json({ auth, token })

    } catch (error) {
        console.log('Login() ERROR: ', error)
        res.status(500).json({ error: 'Server side errror. Try again later.' })
    }
}

async function ForgetPassword(req, res) {
    try {
        if (!req?.body?.email) {
            res.status(409).json({ error: 'Email is required.' })
            return
        }
        //-- object for search query -----------------
        const email = req.body.email.toLowerCase().replace(/['"]/g, '\\$&')
        let searchObj = {
            columns: `id, name`,
            table: 'users',
            where: `email = '${email}'`
        }
        let user = await search(searchObj);//-- search query call -------------
        // console.log(user);
        if (!user[0]?.id) {
            res.status(404).json({ error: 'User not exists.' })
            return
        }

        let token = await generateToken({ id: user[0].id }, '10m')

        let isMailSent = await sendForgotMail({ email: req.body.email, name: user[0].name, token })
        // console.log('IsMailSent: ', isMailSent);
        if (!isMailSent?.messageId) {
            res.status(500).json({ error: 'Unable to send email. Try again later.' })
            return
        }
        res.status(200).json({ message: 'Email send successfully visit your email.' })
    } catch (error) {
        console.log('ForgetPassword() ERROR: ', error);
        res.status(500).json({ error: 'Server side error. Try again later.' })
    }
}

async function sendForgotMail(paramsObj) {
    return new Promise(async (resolve, reject) => {
        try {
            let htmlContent = `<h1 style="font-family: sans-serif; text-align: center; background: purple; color: white; padding-block: 20px; border-radius: 10px;">Paridhana</h1>
            <div style="font-family: sans-serif;">
                <p>Thanks for being with Paridhana</p>
                <a style="border: none; background: purple; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin: 0 25px; width: fit-content; text-decoration: none; cursor: pointer;" href='${process.env.REDIRECTPATH}/jwtLogin?token=${paramsObj.token}' >Continue as ${paramsObj.name}</a>
                <p>Shop with us without worries because we provide best quality product's for you.</p>
                <p>This link is valid for only 10 minutes.</p>
            </div>`

            let subject = 'Forgot password Email'

            let params = {
                email: paramsObj.email,
                name: paramsObj.name,
                subject: subject,
                htmlContent: htmlContent
            }

            let response = await verificationMail(params)

            if (response?.messageId)
                resolve(response)
            else
                reject(response)
        } catch (error) {
            reject(error)
        }
    })
}

async function JwtLogin(req, res) {
    try {
        if (!req?.query?.token) {
            res.status(401).user({ error: 'Token not found.' })
            return
        }

        const istoken = await verifyToken(req.query.token)
        if (!istoken?.id) {
            res.status(401).json({ error: 'Invalid token' })
            return
        }
        const searchObj = {
            columns: `id, isVerified, name, role, email`,
            table: 'users',
            where: `id = '${istoken.id}'`
        }
        //-- search for the user ------------------
        const user = await search(searchObj)
        console.log('Users: ', user[0]);
        //-- if user not found -------------------------
        if (!user[0]?.id) {
            res.status(404).json({ error: 'User not exists.' })
            return
        }
        //-- if user not verified ----------------------
        if (user[0]?.isVerified == 0) {
            res.status(401).json({ error: 'Please verify your email first.' })
            return
        }
        user[0].email = user[0].email.replace(/[\\]/g, '');
        //-- generate token for stateless authorization. Validation of 30 days ----------------------
        const token = await generateToken({ id: user[0].id, email: user[0].email })
        //-- object for client side authorization. Store it in client side localStorage ------------------------------
        const auth = {
            name: user[0].name,
            role: user[0].role
        }
        res.status(200).json({ auth, token })

    } catch (error) {
        console.log('JwtLogin() ERROR: ', error);
        res.status(500).json({ error: error.message })
    }
}

async function ChangePassword(req, res) {
    try {
        if (!req?.body?.newPassword) {
            res.status(409).json({ error: `New Password is required.` })
            return
        }
        const updateObj = {
            table: 'users',
            set: `password = '${req.body.newPassword}'`,
            where: `id = '${req.body.id}'`
        }
        const isUpdated = await update(updateObj)
        // console.log(isUpdated);
        if (isUpdated.changedRows)
            res.status(200).json({ message: 'Password updated.' })
        else
            res.status(401).json({ message: `Password can't be same as old.` })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}

async function AddProducts(req, res) {
    try {
        const res = await fetch('https://dummyjson.com/products?limit=100&skip=0').then(res=>res.json())

        let len = res.products.length
        while (len--) {
            const id = uuid()
            const productinsertObj = {
                table: 'products',
                values: [id, '1', res.products[len].thumbnail, res.products[len].title, res.products[len].brand, res.products[len].description, res.products[len].category, res.products[len].price, res.products[len].stock, res.products[len].rating, '', '']
            }
            await insert(productinsertObj)

            let imglen = res.products[len].images.length
            while (imglen--) {
                const imageinsertObj = {
                    table: 'productimages',
                    values: [uuid(), id, res.products[len].images[imglen], '', '']
                }
                await insert(imageinsertObj)
            }
        }

    } catch (error) {
        console.log('AddProducts() Error: ',error);
    }
}
//AddProducts();

module.exports = {
    SignupUser,
    VerifyUser,
    SendVerificationMail,
    Login,
    ForgetPassword,
    JwtLogin,
    ChangePassword,
}