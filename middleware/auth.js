// MIDDLEWARE FOR AUTHENTICATING A USER

// required auth module
const jwt = require('jsonwebtoken');
const config = require('config')

function auth(req, res, next) {
    // get the token from the request header
    const token = req.header('x-auth-token');

    if (!token) {
        // theres no token [x-auth-token] in the request headers
        // so, process is terminated
        return res.status(401).json({
            status: 401,
            message: 'no token provided..'
        });
    } else {
        try {
            // decode and add a user property to the request object
            const decoded = jwt.verify(token, config.get('jwtPass'));
            req.user = decoded;

            // passes control to the next middleware in the (req, res) pipeline
            next()
        } catch (ex) {
            // the token that was sent is not valid;
            return res.status(400).josn({
                status: 400,
                message: 'invalid token'
            });
        }
    }
}

module.exports = auth;