/* 
    FILE THAT CONTAINS ROUTE HANDLER FOR LOGGING A USER IN
 */

// needed module in the file
const express = require('express');
const config = require('config');
const router = express.Router();
const bcrypt = require('bcrypt');
const _ = require('lodash');

// needed middleware and local module
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');
const { User, validateLogin } = require('../model/userM');

// route handler for logging user in
router.post('/', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;
    // check if a user exist with the same email
    const user = await User.findOne({ email: email });

    // if a user does exist with the same email, the process should be terminated
    if (!user) {
        // no user with the sent email
        return res.status(400).json({
            status: 400,
            message: 'invalid email or password...'
        });
    } else {
        // chack for the validity of the sent password
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            // the password doesnt match with the saved password
            return res.status(400).json({
                status: 400,
                message: 'invalid email or password...'
            });
        } else {
            // generate the auth token and get when the token will expires
            const token = user.generateToken();
            const tokenExpiresInSeconds = config.get('jwtExpires') / 1000;
            const toReturn = _.pick(user, ['email', '_id', 'messages']);

            // success response
            res.header('x-auth-token', token).json({
                status: 200,
                expiresIn: tokenExpiresInSeconds,
                user: toReturn
            });
        }
    }
}));

module.exports = router;