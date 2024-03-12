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

        res.status(200).json({ message: products[0] })
    } catch (error) {
        console.log('Products() Error: ', error);
        res.status(500).json({ error: 'Server side error occured' })
    }
}


module.exports = {
    Products,
}