/* 
    FILE THAT CONTAINS ROUTE HANDLERS FOR USER RELATED SERVICE FOR THE APP;
 */

// required module in the file
const express = require('express');
const router = express.Router();
const _ = require('lodash');

// middlewares and other required local modules
const wrapper = require('../middleware/wrapper');
const { User } = require('../model/userM');
const { Comment, validateMessage } = require('../model/message');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

// middleware for route handlers 
const adminMiddleware = [ auth, admin ];
const adminIdMiddleware = [ idValidator, auth, admin ];
const bodyIdMiddleware = [ idValidator, bodyValidator(validateMessage) ];

// route handler for getting the list of users by the admin
router.get('/', adminMiddleware, wrapper ( async (req, res) => {
    // get all the user and the password shouldnt be included
    const users = await User.find()
        .select({ password: 0 });

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: users
    });
}));

// ! for admins
// route handler for getting a single user, only by the admin
router.get('/one/:id', adminIdMiddleware , wrapper ( async (req, res) => {
    const { id } = req.params;

    // find the user document by the sent id
    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        // theres no user with the passed id
        return res.status(404).json({
            status: 404,
            message: 'no such user in the database'
        });
    } else {
        // success reponse
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

// route handler for deleting a single user, only by the admin
router.delete('/remove/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    // get the user id and remove if the user exist in the db
    const { id } = req.params;
    const user = await User.findByIdAndRemove(id);

    if (!user) {
        // the user with the id doesnt exist 
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database'
        });
    } else {
        // success exist
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

// route handler fir getting the messages that belongs to the user
router.get('/my-messages', auth, wrapper ( async (req, res) => {
    // get the user id from the property set in the auth middleware, and find the admin by its id
    const id = req.user._id;  
    const user = await User.findById(id);

    // extract the message from the user document
    const message = user.messages

    // success reponse
    res.status(200).json({
        status: 200,
        message: 'success',
        data: message
    });
}));


// route handler for sending a user an anonymous post
router.post('/send-message/:id', bodyIdMiddleware, wrapper ( async (req, res) => {
    // extract the user id and find the user by its id;
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
        // the user doesnt exist in the db
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database'
        });
    } else {
        // create the comment document and save
        const { content } = req.body
        const message = new Comment({ content });
        await message.save();

        // push the message into the user document and save user document
        user.messages.push(message);
        await user.save();

        // success response
        res.status(201).json({
            status: 201,
            message: 'success',
            data: 'message sent successfully'
        });
    }
}));

module.exports = router;