const { verifyToken } = require('./tokenHandler');

async function authenticate(req, res, next) {
    try {
        if (!req?.headers?.authorization) {
            res.status(409).json({ error: 'Token not found.' })
            return;
        }
        const token = await verifyToken(req.headers.authorization);
        req.body.id = token.id
        req.body.email = token.email

        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: error.message })
    }
}

module.exports = { authenticate }