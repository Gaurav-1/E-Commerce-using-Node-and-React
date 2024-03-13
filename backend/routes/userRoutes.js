const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/authenticate');
const {
    Products,
    AddToCart,
    MyCart,
    UpdateQuantity,
} = require('../controllers/userController')

router.route('/products')
    .all(authenticate)
    .get(Products)

// router.route('/productDetail')
//     .all(authenticate)
//     .post()

router.route('/addToCart')
    .all(authenticate)
    .post(AddToCart)

router.route('/myCart')
    .all(authenticate)
    .get(MyCart)

router.route('/updateQuantity')
    .all(authenticate)
    .post(UpdateQuantity)

// router.route('/deleteFromCart')
//     .all(authenticate)
//     .post()

// router.route('/order')
//     .all(authenticate)
//     .post()

// router.route('/myOrder')
//     .all(authenticate)
//     .get()

// router.route('/cancelMyOrders')
//     .all(authenticate)
//     .post()

// router.route('/changePassword/:id')
//     .post()

// router.route('/changePassword')
//     .all(authenticate)
//     .post()

// router.route('/profile')
//     .all(authenticate)
//     .post()


module.exports = router