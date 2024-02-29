const jwt = require('jsonwebtoken');

function generateToken(params, validTill = '30d') {
    console.log({...params})
    console.log(validTill);
    return jwt.sign(params, process.env.SECRETKEY, { expiresIn: validTill })
}

function verifyToken(token) {
    return new Promise((resolve, reject) => {
        try {
            if (!token)
                reject('!! Token not found !!')
            else {
                jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
                    if (err)
                        reject(err)
                    else
                        resolve(decoded)
                })
            }
        } catch (error) {
            reject(error)
        }
    })

}

module.exports = { generateToken, verifyToken }