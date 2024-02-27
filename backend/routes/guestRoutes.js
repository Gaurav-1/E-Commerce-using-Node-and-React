const express = require('express');
const router = express.Router();
const {
    SignupUser
} = require('../controllers/guestController')

router.route('/signup')
    .post(SignupUser)

// router.route('/sellerSingup')
//     .post()

// router.route('/login')
//     .post()

// router.route('/forgetPassword')
//     .post()

// router.route('/sendVerificationMail')
//     .post()

// router.route('/verify/:id')
//     .get()

module.exports = router