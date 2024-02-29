const express = require('express');
const router = express.Router();
const {
    SignupUser,
    VerfyGuest,
} = require('../controllers/guestController')

router.route('/signup')
    .post(SignupUser)

router.route('/verify')
    .get(VerfyGuest)
    
// router.route('/sellerSingup')
//     .post()

// router.route('/login')
//     .post()

// router.route('/forgetPassword')
//     .post()

// router.route('/sendVerificationMail')
//     .post()


module.exports = router