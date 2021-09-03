/* 
    FILE THAT CONTAINS ROUTE HANDLER FOR REGISTERING A NEW USER;
 */

// required module in the file
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const config = require('config');
const _ = require('lodash');

// required middleware and other module
const wrapper = require('../middleware/wrapper');
const { User, validate } = require('../model/userM');
const bodyValidator = require('../middleware/bodyValidator');

// route handler for registering a new user
router.post('/', bodyValidator(validate), wrapper ( async (req, res) => {
    let { email, password } = req.body;
    // search if a user exist with the same email that was passed
    let user = await User.findOne({ email: email });

    // if a user exists with same email, the process should be terminated
    if (user) {
        // a user exist with the same email
        return res.status(400).json({
            status: 400,
            message: 'the same email is being used by another user'
        });
    } else {
        // generate salt and hash the password with the salt
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        // create and save new user
        user = new User({ email, password });
        await user.save();

        // generate values to be retured to the user
        const toReturn = _.pick(user, ['_id', 'email'])
        const token = user.generateToken();
        const tokenExpiresInSeconds = config.get('jwtExpires') / 1000;

        // success reponse
        res.header('x-auth-token', token)
            .status(201)
            .json({
                status: 201,
                expiresIn: tokenExpiresInSeconds,
                user: toReturn
            });
    }
}));

module.exports = router;