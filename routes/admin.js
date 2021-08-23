const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Admin, validate, validatePass, validateLogin } = require('../model/admin');
const _ = require('lodash');
const wrap = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const bcrypt = require('bcrypt');
const val = mongoose.Types.ObjectId;

const adminWare = [ auth, admin ];
const superWare = [ auth, admin, superAdmin ];

router.get('/', superWare, wrap (async (req, res) => {
    // only by admins only super admin
    const admin = await Admin.find()
        .select('-password');

    res.send(admin);
}));

router.get('/:id', adminWare, async (req, res) => {
    // admin or user
    const { id } = req.params;

    if (!val.isValid(id)) {
        return res.status(404).send('invalid user id');
    } else {
        const admin = await Admin.findById(id)
            .select('-password');

        if (!admin) {
            return res.status(404).send('no such user in the database');
        } else {
            res.send(admin);
        }
    }
});

router.delete('/:id', superWare, async (req, res) => {
    // user or admins only super admin
    const { id } = req.params;

    if (!val.isValid(id)) {
        return res.status(404).send('invalid user id')
    } else {
        const admin = await Admin.findByIdAndRemove(id);
        if (!admin) {
            return res.status(404).send('no such user in our database...')
        } else {
           res.send(admin)
        }
    }
});

router.put('/:id/change-password', adminWare, async (req, res) => {
    // only user and admin;
    const { id } = req.params;

    if (req.user._id != id) {
        return res.status(400).send('you broke something..');
    }

    if (!val.isValid(id)) {
        return res.status(404).send('invalid user id')
    } else {
        const { error } = validatePass(req.body);
        if (error) {
            return  res.status(400).send(error.details[0].message);
        } else {
            let { email, oldPassword, newPassword } = req.body;
            const admin = await Admin.findOne({email : email});
            if (!admin) {
                return res.status(400).send('invalid username or password')
            } else {
                const isValid = await bcrypt.compare(oldPassword, admin.password);
                if (!isValid) {
                    return res.status(400).send('invalid username or password')
                } else {
                    const salt = await bcrypt.genSalt(10);
                    newPassword = await bcrypt.hash(newPassword, salt);
                    admin.password = newPassword;
                    await admin.save();
                    res.send('password has been changed')
                }
            }
        }
    }
});

router.post('/register', async (req, res) => {
    //only super user
    const admins = await Admin.find()
        .count();
    if (admins >= 5) {
        return res.status(400).send('there cant be anymore admin in here..')
    } else {
        const { error } = validate(req.body);
        if (error) {
            console.log(req.body)
            return res.status(400).send(error.details[0].message);
        } else {
            let { name, password, email } = req.body;
            let admin = await Admin.findOne({email : email});
            if (admin) {
                return res.status(400).send('we have a user with same email')
            } else {
                admin = new Admin({
                    name,
                    email
                });

                const salt = await bcrypt.genSalt(10);
                password = await bcrypt.hash(password, salt);
                admin.password = password;

                if (admins == 0) {
                    admin.superAdmin = true;
                } else {
                    admin.superAdmin = false;
                }

                await admin.save();
                const token = admin.generateToken();
                const toReturn = _.pick(admin, ['name', 'email'])
                res.header('x-auth-token', token).send(toReturn);
            }
        }
    }
});


router.post('/login', async (req, res) => {
    // anyone
    const { error } = validateLogin(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    } else {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email: email });
        if (!admin) {
            return res.status(400).send('invalid email or password...');
        } else {
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid) {
                return res.status(400).send('invalid email or password');
            } else {
                const token = admin.generateToken();
                res.header('x-auth-token', token).send('youre welcome back user');
            }
        }
    }
})


module.exports = router;