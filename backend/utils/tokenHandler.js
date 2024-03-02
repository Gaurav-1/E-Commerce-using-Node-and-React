const jwt = require('jsonwebtoken');

async function generateToken(params, validTill = '30d') {
    return new Promise((resolve, reject) => {
        try {
            console.log('Token parameters: ',{...params})
            console.log('Token validation: ',validTill);
            if (Object.keys(params).length > 0){
                let token = jwt.sign(params, process.env.SECRETKEY, { expiresIn: validTill })
                resolve(token)
            }
            else
                throw new Error('Token parameters required')
        } catch (error) {
            reject(error.message)
        }
    })
}

async function verifyToken(token) {
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