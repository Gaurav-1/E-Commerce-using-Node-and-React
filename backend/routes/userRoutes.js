const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/authenticate');
const {
    Products,
    AddToCart,
    MyCart,
    UpdateQuantity,
    DeleteFromCart,
    MyOrders,
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
    .patch(UpdateQuantity)

router.route('/deleteFromCart')
    .all(authenticate)
    .delete(DeleteFromCart)

// router.route('/placeOrder')
//     .all(authenticate)
//     .post()

router.route('/myOrders')
    .all(authenticate)
    .get(MyOrders)

// router.route('/cancelMyOrders')
//     .all(authenticate)
//     .post()

// router.route('/trackOrder')
//     .all(authenticate)
//     .post()

// router.route('/profile')
//     .all(authenticate)
//     .post()


module.exports = router