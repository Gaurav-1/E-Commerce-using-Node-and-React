const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/authenticate')

router.route('/dashboard')
    .all(authenticate)
    .get()

router.route('/addProduct')
    .all(authenticate)
    .post()

router.route('/updateProduct')
    .all(authenticate)
    .post()

router.route('/deleteProduct')
    .all(authenticate)
    .post()

router.route('/orders')
    .get()

router.route('/approveOrder')
    .all(authenticate)
    .post()

router.route('/rejectOrder')
    .all(authenticate)
    .post()

router.route('/profile')
    .all(authenticate)
    .post()

router.all('/*', (req, res) => res.status(400).send('Bad Request'))