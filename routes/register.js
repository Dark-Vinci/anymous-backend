const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const config = require('config');
const _ = require('lodash');

const wrapper = require('../middleware/wrapper');
const { User, validate } = require('../model/userM');
const bodyValidator = require('../middleware/bodyValidator');

// route handler for registering a new user
router.post('/', bodyValidator(validate), wrapper ( async (req, res) => {
    let { email, password } = req.body;
    let user = await User.findOne({ email: email });

    if (user) {
        return res.status(400).json({
            status: 400,
            message: 'the same email is being used by another user'
        });
    } else {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        user = new User({ email, password });
        await user.save();

        const toReturn = _.pick(user, ['_id', 'email'])
        const token = user.generateToken();
        const tokenExpiresInSeconds = config.get('jwtExpires') / 1000;

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