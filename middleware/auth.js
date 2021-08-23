const jwt = require('jsonwebtoken');
const config = require('config')

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).send('no token provided..')
    } else {
        try {
            const decoded = jwt.verify(token, config.get('jwtPass'));
            req.user = decoded;
            next()
        } catch (ex) {
            return res.status(400).send('invalid token...')
        }
    }
}

module.exports = auth;