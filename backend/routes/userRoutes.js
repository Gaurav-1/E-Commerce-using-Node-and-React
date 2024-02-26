const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/authenticate');

router.route('/products')
    .all(authenticate)
    .get()

router.route('/productDetail')
    .all(authenticate)
    .post()

router.route('/myCart')
    .all(authenticate)
    .get()

router.route('/addToCart')
    .all(authenticate)
    .post()

router.route('/updateQuantity')
    .all(authenticate)
    .post()

router.route('/deleteFromCart')
    .all(authenticate)
    .post()

router.route('/order')
    .all(authenticate)
    .post()

router.route('/myOrder')
    .all(authenticate)
    .get()

router.route('/cancelMyOrders')
    .all(authenticate)
    .post()

router.route('/changePassword/:id')
    .post()

router.route('/changePassword')
    .all(authenticate)
    .post()

router.route('/profile')
    .all(authenticate)
    .post()
