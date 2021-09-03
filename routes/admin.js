/* 
    FILE THAT CONTAINS ANY ADMIN RELATED ROUTE HANDLERS,
    THE ROUTE HANLDER CAN ONLY BE REACHED BY THE ADMIN
 */

// required module for this file
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

// required middlewares
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/idValidator');

const { 
    Admin, validate, 
    validatePass, validateLogin 
} = require('../model/admin');

// array of route handler middlewares
const superAdminIdMiddleware = [ 
    idValidator, auth, 
    admin, superAdmin 
];
const adminBodyPasswordChnageMiddleware = [
    auth, admin, bodyValidator(validatePass) 
];
const adminMiddleware = [ auth, admin ];
const adminIdValidator = [ idValidator, auth, admin ];

// route handler for getting all the admin in the database
router.get('/all-admin', adminMiddleware, wrapper ( async (req, res) => {
    // query the db for all admins and the password shouldnt be returned
    const admins = await Admin.find()
        .select({ password: 0 });

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    });
}));

// route handler for getting an admin by its id
router.get('/one/:id', adminIdValidator, wrapper ( async (req, res) => {
    // get the id and find the admin by its id[password shouldnt be included]
    const { id } = req.params;
    const admin = await Admin.findById(id)
        .select({ password: 0 });

    if (!admin) {
        // the admin withe the object id is not in the database
        return res.status(404).json({
            status: 404,
            message: 'no such user in the database'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
}));

// route handler for deleting an admin, just for the super admin
router.delete('/remove/:id', superAdminIdMiddleware, wrapper ( async (req, res) => {
    // get the id and remove the admin directly if the id matches with an admin
    const { id } = req.params;
    const admin = await Admin.findByIdAndRemove(id);

    if (!admin) {
        // theres no admin in the database that matched the send id
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database...'
        });
    } else {
        // admin object successfully deleted
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
}));

// route handler for changing an admin password
router.put('/change-password', adminBodyPasswordChnageMiddleware, wrapper ( async (req, res) => {
    // get the user id from the property set in the auth middleware, and find the admin by its id
    const id = req.user._id;
    const admin = await Admin.findById(id);

    let { oldPassword, newPassword } = req.body; 

    // check if the password is valid
    const isValid = await bcrypt.compare(oldPassword, admin.password);

    if (!isValid) {
        // the sent password is not equal with the first
        return res.status(400).json({
            status: 400,
            message: 'invalid username or password'
        });
    } else {
        // generate salt and hash the new password with salt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // change the password
        admin.password = hashedPassword;

        // save the admin document
        await admin.save();

        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        });
    }
}));

// route handler for changing an admin password
router.post('/register', bodyValidator(validate), wrapper ( async (req, res) => {
    // count the number of admins in the database
    const adminCount = await Admin.find().count();

    // ifthe number of admin in the db is 3, no other admin should be saved
    if (adminCount >= 3) {
        // the number of admin is greater or equal to 3
        return res.status(400).json({
            status: 400,
            message: 'there cant be anymore admin in here..'
        });
    } else {
        let { name, password, email } = req.body;
        // find if a user with same email exists in the db
        // if a user exist, the process should be terminated to avoid collision in email 
        let admin = await Admin.findOne({ email : email });

        if (admin) {
            // a user already exist with same email
            return res.status(400).json({
                status: 400,
                message: 'we have a user with same email'
            });
        } else {
            // generate salt and hash the password with the salt
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);

            // create the admin object
            admin = new Admin({ name, email, password });

            // if the admin is the first admin, he should be made super admin
            if (adminCount == 0) {
                // making the superAdmin
                admin.superAdmin = true;
            } else {
                admin.superAdmin = false;
            }

            // saving the admin document
            await admin.save();

            // generate the auth token and get the data to be returned
            const token = admin.generateToken();
            const toReturn = _.pick(admin, ['name', 'email']);

            // success response
            res.status(201)
                .header('x-auth-token', token)
                .json({
                    status: 201,
                    message: 'success', 
                    data: toReturn
                });
        }
    }
}));

// route handler for logging an admin in
router.post('/login', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;

    // search the db an admin document with the same email
    const admin = await Admin.findOne({ email });

    if (!admin) {
        // theres no admin document in the db with the passed email
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password...'
        });
    } else {
        // check if the sent password is equal to the admin password
        const valid = await bcrypt.compare(password, admin.password);

        if (!valid) {
            // the sent password is not valid
            res.status(400).json({
                status: 400,
                message: 'invalid email or password'
            })
        } else {
            // generate the token since the admin is now valid 
            const token = admin.generateToken();

            // success response
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