require('dotenv').config();
const mysql = require('mysql')

const userTb = `CREATE TABLE IF NOT EXISTS users(
    id VARCHAR(255),
    name VARCHAR(255),
    mail VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    isVerified TINYINT(1),
    role VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id)
);`

const sellerTb = `CREATE TABLE IF NOT EXISTS sellers(
    id VARCHAR(255),
    isApproved TINYINT(1),
    profileImage VARCHAR(255),
    contact INT(10),
    gstNumber VARCHAR(255),
    aadharId VARCHAR(16),
    aadharImage VARCHAR(255),
    panId VARCHAR(10),
    panImage VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT SellerIdFKKey FOREIGN KEY(id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT warehouseIdFKKey FOREIGN KEY(shopId) REFERENCES shops(id)
);`

const shopsTb = `CREATE TABLE IF NOT EXISTS shops(
    id VARCHAR(255),
    shopId VARCHAR(255),
    name VARCHAR(255),
    storeImage VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pincode INT(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id)
);`

const productTb = `CREATE TABLE IF NOT EXISTS products(
    id VARCHAR(255),
    sellerId VARCHAR(255),
    image VARCHAR(255),
    name VARCHAR(255),
    brand VARCHAR(255),
    description VARCHAR(255),
    category VARCHAR(255),
    price INT(10),
    stock INT(10),
    rating VARCHAR(1),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT productSellerIdFKKey FOREIGN KEY(sellerId) REFERENCES sellers(id)
);`

const productImagesTb = `CREATE TABLE IF NOT EXISTS productimages(
    productId VARCHAR(255),
    image VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT productImagesProductIdFKKey FOREIGN KEY(productId) REFERENCES products(id)
);`

const expoterTb = `CREATE TABLE IF NOT EXISTS expoter(
    id VARCHAR(255),
    name VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT ExpoterFKKey FOREIGN KEY(id) REFERENCES users(id)
);`

const warehousesTb = `CREATE TABLE IF NOT EXISTS warehouses(
    id VARCHAR(255),
    expoterId VARCHAR(255),
    name VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pincode INT(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT warehouseExpoterIdFKKey FOREIGN KEY(expoterId) REFERENCES expoter(id)
);`

const deliveryPersonTb = `CREATE TABLE IF NOT EXISTS deliveryperson(
    id VARCHAR(255),
    name VARCHAR(255),
    warehouseId VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT DeliveryPersonFKKey FOREIGN KEY(id) REFERENCES users(id)
);`

const addressTb = `CREATE TABLE IF NOT EXISTS address(
    id VARCHAR(255),
    userId VARCHAR(255),
    reciverName VARCHAR(255),
    contactNumber INT(11),
    houseNo VARCHAR(255),
    street VARCHAR(255),
    landmark VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(255), 
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT AddressFKKey FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
);`

const orderTb = `CREATE TABLE IF NOT EXISTS orders(
    id VARCHAR(255),
    userId VARCHAR(255),
    productId VARCHAR(255),
    addressId VARCHAR(255),
    quantity int(11),
    deliveryDate DATE,
    cancelDate DATETIME,
    cancelType VARCHAR(255),
    cancelReason VARCHAR(255),
    bill INT(11),
    paymentMode VARCHAR(50),
    paymentStatus TINYINT(1),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT PKKey PRIMARY KEY(id),
    CONSTRAINT OrdersUFKKey FOREIGN KEY(userId) REFERENCES users(id),
    CONSTRAINT OrdersPFKKey FOREIGN KEY(productId) REFERENCES products(id),
    CONSTRAINT OrdersAFKKey FOREIGN KEY(addressId) REFERENCES address(id)
);`


const multipleStatementConncetion = mysql.createConnection({
    host: process.env.DBHOST,
    user: 'root',
    password: '',
    database: 'react_ecommerce',
    multipleStatements: true
})

try {
    multipleStatementConncetion.connect();
    multipleStatementConncetion.query(`${userTb} ${sellerTb} ${shopsTb} ${productTb} ${productImagesTb} ${expoterTb} ${warehousesTb} ${deliveryPersonTb} ${addressTb} ${orderTb}`, (error, result) => {
        if (error) console.log(error)
        else console.log('Tables created');
    })
}
catch (err) {
    console.log('CREATE TABLE ERROR: ', err)
}
finally {
    multipleStatementConncetion.end();
}
