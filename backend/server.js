require('dotenv').config();

const express = require('express')
const cors = require('cors');
const upload = require('multer')
const mainRoutes = require('./routes/mainRoutes')
const userRoutes = require('./routes/userRoutes')

require('./database/TBqueries')

//-- express instance ---------------
const app = express();

//-- object for cors exceptions ----------------
const config = {
    origin: ['http://localhost:5173'],
    credentials: true,
}
//-- cors exception added ----------------
app.use(cors(config))
//-- cors expception completed -------------------

//-- express middlewares -------------------------
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./pulbic'))
//------------------------------------------------

//-- middleware to check path and body of the request ----------
app.use((req, res, next) => {
    console.log('req.path = ', req.path);
    console.log('req.method = ', req.method);
    console.log('req.body = ', req.body);

    next();
})

//-- backend port ---------------------------
const port = process.env.PORT || 3000

//-- port listener --------------------------
try {
    app.listen(port, (req, res) => {
        console.log('Hearing PORT: ', port);
    })
}
catch (err) {
    console.log('SERVER RUN ERROR: ', err   )
}

// https://dummyjson.com/products?limit=100&skip=0



//-- user routes --------------
app.use('/user',userRoutes)

//-- seller routes ------------
// app.use('/seller')

//-- expoter routes -----------
// app.use('/expoter')

//-- admin routes -------------
// app.use('/admin')

//-- guest routes -------------
app.use('/',mainRoutes)

//-- not a valid route ------------------w
app.all('*', (req, res) => res.status(404).send('Bad Request'))