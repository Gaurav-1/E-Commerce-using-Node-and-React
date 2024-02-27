const { v4: uuid } = require('uuid')
const nodemailer = require('nodemailer')
const {
    search,
    insert,
} = require('../database/queries')

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kohligaurav845@gmail.com",
        pass: "djub zhzs mrji afrf"
    },
});



async function SignupUser(req, res) {
    // console.log(req.body);

    if (req.body == '') {
        res.status(404).send('body is not found')
        return
    }

    let searchObj = {
        columns: ['COUNT(mail) AS isExists'],
        table: 'users',
        condition: 'mail',
        value: req.body.email
    }

    let user = await search(searchObj)
    // console.log('Returend: ',user[0].mail);
    if (user[0].isExists > 0) {
        res.status(409).send('User Already Exists')
        return
    }

    let id = uuid()
    let insertObj = {
        table: 'users',
        values: [id, req.body.name, req.body.email, req.body.password, 0, 'user', null, null]
    }

    let isInserted = await insert(insertObj)
    // console.log(isInserted)
    if (isInserted.affectedRows == 1){
        
        res.status(200).send('Signup Successfully Done. Please Verify it')
    }
    else
        res.status(500).send('Singup failed due to server error')
}

module.exports = {
    SignupUser,
}