const { v4: uuid } = require('uuid')
const nodemailer = require('nodemailer')
const { generateToken, verifyToken } = require('../utils/tokenHandler')
const {
    search,
    insert,
    update,
    deletes,
} = require('../database/queries')
const { errorMonitor } = require('nodemailer/lib/xoauth2')

//-- searchObj = { columns: `columns`, table: 'table name', where: `where condition` } ---------------
//-- insertObj = { table: 'table name', values: [values] } ----------------------
//-- updateObj = { table: 'table name', set: `columns = values`, where: `where condition` } ----------
//-- deleteObj = { table: 'table name', where: `where condition` } -----------------

async function Products(req, res) {
    try {
        if (!req?.query?.limit && !req?.query?.skip || req?.query?.limit < 1 || req?.query?.skip < 0) {
            res.status(401).json({ error: 'Paggination not recived' })
            return
        }
        //-- search the product based on limit and skip -------------------------
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

        //-- search the product for some validation ---------------------
        const ProductSearchObj = {
            columns: `id, stock, price`,
            table: 'products',
            where: `id = '${req.body.productId}'`
        }
        const products = await search(ProductSearchObj)
        if (!products[0]) {
            res.status(401).json({ error: 'Invalid Product ID.' })
            return
        }
        //-- stock checking ---------------------------
        if(products[0]?.stock < 1){
            res.status(409).json({error: 'Product out of stock.'})
            return
        }

        //-- search for the existing cart -------------------------------
        const CartSearchObj = {
            columns: `*`,
            table: 'carts',
            where: `userId = '${req.body.id}' AND productId = '${req.body.productId}'`
        }
        const cart = await search(CartSearchObj)
        //-- check the cart quantity max limit ----------------------
        if (cart[0]?.quantity == 10) {
            res.status(409).json({ error: 'Maximum limit reached.' })
            return
        }
        //-- if no cart found -------------------
        if (!cart[0]?.userId) {
            //-- insert new cart -------------------------
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
        //-- if cart found -------------------------
        else {
            //-- update the quantity of existing cart ------------------------
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
        //-- search for the user cart with user id and product id ------------------------
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

async function UpdateQuantity(req, res) {
    try {
        if (!req?.body?.productId || !req.body?.operation || req.body.operation.length != 1 || !['-', '+'].some(el => req.body.operation.includes(el))) {
            res.status(401).json({ error: 'Proper details not recived.' })
            return
        }
        //-- search for cart first for some validation
        const searchObj = {
            columns: `*`,
            table: 'carts',
            where: `userId = '${req.body.id}' AND productId = '${req.body.productId}'`
        }
        const cart = await search(searchObj)
        if (!cart[0]) {
            res.status(409).json({ error: 'Cart item not found.' })
            return
        }
        //-- checks for limit because sql throws error and currently unable to handle ----------------------
        if (cart[0]?.quantity == 1 && req?.body?.operation == '-') {
            res.status(409).json({ error: 'Minimum limit reach.' })
            return
        }
        if (cart[0].quantity == 10 && req?.body?.operation == '+') {
            res.status(409).json({ error: 'Maximum limit reached.' })
            return
        }
        //-- update the quantity based on the operation recived -----------------------------
        const updateObj = {
            table: 'carts',
            set: `quantity = quantity ${req.body.operation} 1`,
            where: `userId = '${req.body.id}' AND productId = '${req.body.productId}'`
        }
        const isUpdated = await update(updateObj)
        if (isUpdated?.affectedRows == 1) {
            res.status(200).json({ message: 'Successfully updated.' })
            return
        }
        res.status(401).json({ error: 'Failed to update.' })

    } catch (error) {
        console.log('UpdateQuantity() Error: ', error);
        res.status(500).json({ error: 'Server side error. Try again' })
    }
}

async function DeleteFromCart(req,res){
    try {
        if(!req?.body?.productId){
            res.status(401).json({error: 'Product details not recived'})
            return
        }
        //-- delete the product from carts table ---------------------------
        const deleteObj ={
            table: 'carts',
            where: `userId = '${req.body.id}' AND productId = '${req.body.productId}'`
        }
        const isDeleted = await deletes(deleteObj)
        console.log(isDeleted)
        //-- if product is removed send this response -----------------------
        if(isDeleted?.affectedRows == 1){
            res.status(200).json({message: 'Product removed.'})
            return
        }
        //-- if product is not removed send this response -----------------------
        res.status(409).json({error: 'Unable to remove the product.'})
    } catch (error) {
        console.log('DeleteFromCart() Error: ',error);
        res.status(500).json({message: 'Server side error.'})
    }
}

module.exports = {
    Products,
    AddToCart,
    MyCart,
    UpdateQuantity,
    DeleteFromCart,
}