const { v4: uuid } = require('uuid')
const nodemailer = require('nodemailer')
const { generateToken, verifyToken } = require('../utils/tokenHandler')
const {
    search,
    insert,
    update,
} = require('../database/queries')
const { errorMonitor } = require('nodemailer/lib/xoauth2')

//-- searchObj = { columns: `columns`, table: 'table name', where: `where condition` } ---------------
//-- insertObj = { table: 'table name', values: [values] } ----------------------
//-- updateObj = { table: 'table name', set: `columns = values`, where: `where condition` } ----------

async function Products(req, res) {
    try {
        if (!req?.query?.limit && !req?.query?.skip || req?.query?.limit < 1 || req?.query?.skip < 0) {
            res.status(401).json({ error: 'Paggination not recived' })
            return
        }

        const searchObj = {
            columns: `id, image, name, brand, description, category, price, stock, rating`,
            table: 'products',
            limit: req.query.limit,
            skip: req.query.skip
        }

        const products = await search(searchObj);
        console.log(products);
        if (!products[0]) {
            res.status(409).json({ error: 'No product found' })
            return
        }

        res.status(200).json({ message: products })
    } catch (error) {
        console.log('Products() Error: ', error);
        res.status(500).json({ error: 'Server side error occured' })
    }
}

async function AddToCart(req, res) {
    try {
        if (!req?.body?.productId) {
            res.status(401).json({ error: 'Proper details not recived' })
            return
        }

        const ProductSearchObj = {
            columns: `id, stock, price`,
            table: 'products',
            where: `id = '${req.body.productId}'`
        }
        const products = await search(ProductSearchObj)
        if (!products[0]) {
            res.status(401).json({ error: 'Invalid Product ID' })
            return
        }

        const CartSearchObj = {
            columns: `*`,
            table: 'carts',
            where: `userId = '${req.body.id}' AND productId = '${req.body.productId}'`
        }
        const cart = await search(CartSearchObj)
        if (cart[0]?.quantity >= 10) {
            res.status(409).json({ error: 'Only 10 products at once.' })
            return
        }
        if (!cart[0]?.userId) {
            const insertObj = {
                table: 'carts',
                values: [req.body.id, req.body.productId, 1, products[0].price, '', '']
            }
            const isInserted = await insert(insertObj)
            if (isInserted.affectedRows == 1)
                res.status(200).json({ message: 'Product added to cart.' })
            else
                res.status(409).json({ error: 'Failed to add in cart.' })
            return
        }
        else {
            const updateObj = {
                table: 'carts',
                set: `quantity = quantity + 1`,
                where: `userId = '${req.body.id}' AND productId = '${req.body.productId}'`
            }
            const isUpdated = await update(updateObj)
            if (isUpdated.affectedRows == 1)
                res.status(200).json({ message: 'Product added to cart.' })
            else
                res.status(409).json({ error: 'Failed to add in cart.' })
            return
        }
    } catch (error) {
        console.log('AddToCart() Error: ', error);
        res.status(500).json({ error: 'Server side error. Try again' })
    }
}

async function MyCart(req, res) {
    try {
        const searchObj = {
            columns: `*`,
            table: 'carts',
            where: `userId = '${req.body.id}'`
        }
        const cart = await search(searchObj)
        if (!cart[0]?.userId) {
            res.status(409).json({ error: `You haven't placed any order yet` })
            return
        }
        res.status(200).json({ message: cart })
    } catch (error) {
        console.log('MyCart() Error: ', error);
        res.status(500).json({ error: 'Server side error. Try again' })
    }
}

module.exports = {
    Products,
    AddToCart,
    MyCart,
}