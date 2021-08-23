const express = require('express');
const router = express.Router();
const { User, validate } = require('../model/userM');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const wrap = require('../middleware/wrapper');

router.post('/', wrap (async (req, res) => {
    const { error } = validate(req.body);

    if (error) {
        return res.status(400).json({ 
            status: 401,
            message: error.details[0].message 
        });
    } else {
        let { email, password } = req.body;
        let user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).send('the same email is being used by another user');
        } else {
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);

            user = new User({   
                email,
                password
            });
            await user.save();
            const toReturn = _.pick(user, ['_id', 'email'])

            const token = user.generateToken();
            // res.header('x-auth-token', token).send(toReturn);

            res.header('x-auth-token', token).json({
                status: 200,
                expiresIn,
                user: toReturn
            });
        }
    }
}));

module.exports = router;