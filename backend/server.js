require('dotenv').config();

const express = require('express')
const cors = require('cors');
const upload = require('multer')

require('./database/TBqueries')

//-- express instance ---------------
const app = express();

//-- object for cors exceptions ----------------
const config = {
    origin: ['http://localhost:5173'],
    credentials: true,
}

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
    // console.log('req.method = ', req.method);
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


//-- user routes --------------
// app.use('/user')

//-- seller routes ------------
// app.use('/seller')

//-- expoter routes -----------
// app.use('/expoter')

//-- admin routes -------------
// app.use('/admin')