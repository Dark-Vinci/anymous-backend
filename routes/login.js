const express = require('express');
const config = require('config');
const router = express.Router();
const bcrypt = require('bcrypt');

const { User, validateLogin } = require('../model/userM');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');

// route handler for logging user in
router.post('/', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
        return res.status(400).json({
            status: 400,
            message: 'invalid email or password...'
        });
    } else {
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: 'invalid email or password...'
            });
        } else {
            const token = user.generateToken();
            const tokenExpiresInSeconds = config.get('jwtExpires') / 1000;

            res.header('x-auth-token', token).json({
                status: 200,
                expiresIn: tokenExpiresInSeconds,
                user: user
            });
        }
    }
}));

module.exports = router;