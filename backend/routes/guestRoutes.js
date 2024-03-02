const express = require('express');
const router = express.Router();
const {
    SignupUser,
    VerifyGuest,
    SendVerificationMail,
} = require('../controllers/guestController')

router.route('/signup')
    .post(SignupUser)

router.route('/verify')
    .get(VerifyGuest)
    
router.route('/sendVerificationMail')
    .post(SendVerificationMail)

// router.route('/sellerSingup')
//     .post()

// router.route('/login')
//     .post()

// router.route('/forgetPassword')
//     .post()



module.exports = router