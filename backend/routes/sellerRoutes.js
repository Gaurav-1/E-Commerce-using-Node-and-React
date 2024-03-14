const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/authenticate')

// router.route('/dashboard')
//     .all(authenticate)
//     .get()

// router.route('/addProduct')
//     .all(authenticate)
//     .post()

// router.route('/updateProduct')
//     .all(authenticate)
//     .patch()

// router.route('/deleteProduct')
//     .all(authenticate)
//     .delete()

// router.route('/orders')
// .all(authenticate)
//     .get()

// router.route('/approveOrder')
//     .all(authenticate)
//     .patch()

// router.route('/rejectOrder')
//     .all(authenticate)
//     .patch()

// router.route('/profile')
//     .all(authenticate)
//     .post()

module.exports = router