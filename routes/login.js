const express = require('express');
const config = require('config');
const router = express.Router();
const { User, validateLogin } = require('../model/userM');
const bcrypt = require('bcrypt');
const wrap = require('../middleware/wrapper');

router.post('/', wrap( async (req, res) => {
    const { error } = validateLogin(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).send('invalid email or password...');
        } else {
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
                return res.status(400).send('invalid email or password');
            } else {
                const token = user.generateToken();
                const expiresIn = config.get('jwtExpires') / 1000;
                
                res.header('x-auth-token', token).json({
                    status: 200,
                    expiresIn,
                    user: user
                });
            }
        }
    }
}));

module.exports = router;