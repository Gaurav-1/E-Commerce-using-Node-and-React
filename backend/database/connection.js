require('dotenv').config();
const mysql = require('mysql')

const con = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
})

try {
    con.connect();
}
catch (err) {
    console.log('DB CONNECTION ERROR: ', err)
}

module.exports = con