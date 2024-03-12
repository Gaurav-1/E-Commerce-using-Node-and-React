const express = require('express');
const router = express.Router();
const {
    SignupUser,
    VerifyUser,
    SendVerificationMail,
    Login,
    ForgetPassword,
    JwtLogin,
    ChangePassword,
} = require('../controllers/mainController');
const { authenticate } = require('../utils/authenticate');

router.route('/signup')
    .post(SignupUser)

router.route('/verify')
    .get(VerifyUser)

router.route('/sendVerificationMail')
    .post(SendVerificationMail)

// router.route('/sellerSingup')
//     .post()

router.route('/login')
    .post(Login)

router.route('/forgetPassword')
    .post(ForgetPassword)

router.route('/jwtLogin')
    .get(JwtLogin)

router.route('/changePassword')
    .all(authenticate)
    .post(ChangePassword)

module.exports = router