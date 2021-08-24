const express = require('express');
const router = express.Router();
const _ = require('lodash');

const wrapper = require('../middleware/wrapper');
const { User } = require('../model/userM');
const { Comment, validateMessage } = require('../model/message');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');

// middleware for route handlers 
const adminMiddleware = [ auth, admin ];
const adminIdMiddleware = [ idValidator, auth, admin ];
const bodyIdMiddleware = [ idValidator, bodyValidator(validateMessage) ];

// route handler for getting the list of users by the admin
router.get('/', adminMiddleware, wrapper ( async (req, res) => {
    const users = await User.find()
        .select({ password: 0 });

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

    const user = await User.findById(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in the database'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

// route handler for deleting a single user, only by the admin
router.delete('/remove/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id);
    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database...'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

// route handler fir getting the messages that belongs to the user
router.get('/my-messages', auth, wrapper ( async (req, res) => {
    const id = req.user._id;  
    const user = await User.findById(id);

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database...'
        });
    } else {
        const message = user.messages

        res.status(200).json({
            status: 200,
            message: 'success',
            data: message
        });
    }
}));


// route handler for sending a user an anonymous post
router.post('/send-message/:id', bodyIdMiddleware, wrapper ( async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'no such user in our database...'
        });
    } else {
        const { content } = req.body
        const message = new Comment({ content });

        await message.save();
        user.messages.push(message);
        await user.save();

        res.status(201).json({
            status: 201,
            message: 'success',
            data: 'message sent successfully'
        });
    }
}));

module.exports = router;