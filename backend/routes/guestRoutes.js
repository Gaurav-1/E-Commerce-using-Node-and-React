const express = require('express');
const router = express.Router();
const {
    SignupUser,
    VerifyGuest,
    SendVerificationMail,
    Login,
} = require('../controllers/guestController')

router.route('/signup')
    .post(SignupUser)

router.route('/verify')
    .get(VerifyGuest)
    
router.route('/sendVerificationMail')
    .post(SendVerificationMail)

// router.route('/sellerSingup')
//     .post()

router.route('/login')
    .post(Login)

// router.route('/forgetPassword')
//     .post()



module.exports = router