const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/idValidator');
const { Admin, validate, validatePass, validateLogin } = require('../model/admin');

// array of route handler middlewares
const adminMiddleware = [ auth, admin ];
const adminIdValidator = [ idValidator, auth, admin ];
const superAdminIdMiddleware = [ idValidator, auth, admin, superAdmin ];
const adminBodyPasswordChnageMiddleware = [ auth, admin, bodyValidator(validatePass) ];

// route handler for getting all the admin in the database
router.get('/all-admin', adminMiddleware, wrapper ( async (req, res) => {
    const admins = await Admin.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    })
}));

// route handler for getting an admin by its id
router.get('/one/:id', adminIdValidator, wrapper ( async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findById(id)
        .select({ password: 0 });

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in the database'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
}));

// route handler for deleting an admin, just for the super admin
router.delete('/remove/:id', superAdminIdMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findByIdAndRemove(id);

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database...'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
}));

// route handler for changing an admin password
router.put('/change-password', adminBodyPasswordChnageMiddleware, wrapper ( async (req, res) => {
    const id = req.user._id;
    const admin = await Admin.findById(id);

    let { oldPassword, newPassword } = req.body; 

    const isValid = await bcrypt.compare(oldPassword, admin.password);

    if (!isValid) {
        res.status(400).json({
            status: 400,
            message: 'invalid username or password'
        });
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        admin.password = hashedPassword;

        await admin.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        });
    }
}));

// route handler for changing an admin password
router.post('/register', bodyValidator(validate), wrapper ( async (req, res) => {
    const adminCount = await Admin.find().count();

    if (adminCount >= 3) {
        res.status(400).json({
            status: 400,
            message: 'there cant be anymore admin in here..'
        });
    } else {
            let { name, password, email } = req.body;
            let admin = await Admin.findOne({ email : email });

            if (admin) {
                return res.status(400).json({
                    status: 400,
                    message: 'we have a user with same email'
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                password = await bcrypt.hash(password, salt);

                admin = new Admin({ name, email, password });

                if (adminCount == 0) {
                    admin.superAdmin = true;
                } else {
                    admin.superAdmin = false;
                }

                await admin.save();

                const token = admin.generateToken();
                const toReturn = _.pick(admin, ['name', 'email']);

                res.status(201)
                    .header('x-auth-token', token)
                    .json({
                        status: 201,
                        message: 'success', 
                        data: toReturn
                    });
            }
        }
    // }
}));

// route handler for logging an admin in
router.post('/login', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password...'
        });
    } else {
        const valid = await bcrypt.compare(password, admin.password);

        if (!valid) {
            res.status(400).json({
                status: 400,
                message: 'invalid email or password'
            })
        } else {
            const token = admin.generateToken();

            res.status(200)
                .header('x-auth-token', token)
                .json({
                    status: 200,
                    message: 'youre welcome back user'
                });
        }
    }
}));


module.exports = router;