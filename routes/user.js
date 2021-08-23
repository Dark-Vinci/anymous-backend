const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { User } = require('../model/userM');
const { Comment, validateMessage } = require('../model/message');
const _ = require('lodash');
const wrap = require('../middleware/wrapper');
const val = mongoose.Types.ObjectId;

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superAdmin = require('../middleware/superAdmin');
const superWare = [ auth, admin, superAdmin ];

// superWare
router.get('/', async (req, res) => {
    const users = await User.find()
        .select('-password');

    res.send(users);
});

router.get('/one/:id', auth, async (req, res) => {
    const { id } = req.params;

    if (id != req.user._id || !req.user.isAdmin) {
        return res.status(400).send('something is not right...')
    }

    if (!val.isValid(id)) {
        return res.status(404).send('invalid user id');
    } else {
        const user = await User.findById(id)
            .select('-password');

        if (!user) {
            return res.status(404).send('no such user in the database');
        } else {
            res.send(user);
        }
    }
});

router.delete('/:id', superWare, wrap (async (req, res) => {
    const { id } = req.params;

    if (!val.isValid(id)) {
        return res.status(404).send('invalid user id')
    } else {
        const user = await User.findByIdAndRemove(id);
        if (!user) {
            return res.status(404).send('no such user in our database...')
        } else {
           res.send(user)
        }
    }
}));

// router.get('/:id/get-messages', auth, wrap (async (req, res) => {
router.get('/my-messages', auth, wrap (async (req, res) => {
    // only user and admin;
    // const { id } = req.params;

    // if (id != req.user._id || !req.user.isAdmin) {
    //     return res.status(400).send('something is not right...')
    // }
    const id = req.user._id;  

    if (!val.isValid(id)) {
        return res.status(404).send('invalid user id');
    } else {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send('no such user in our database...')
        } else {
            const message = user.messages
            let toReturn = [];

            // if (message.length == 0) {
            //     toReturn = 'no message for you yet'
            // } else {
            //     toReturn = message;
            // }

            res.send(message)
        }
    }
}));

router.post('/send-message/:id', wrap (async (req, res) => {
    // anyone
    if (!val.isValid(req.params.id)) {
        return res.status(404).send('invalid user id')
    } else {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('no such user in our database...')
        } else {
            const { error } = validateMessage(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            } else {
                const { content } = req.body
                const message = new Comment({
                    content: content
                });

                await message.save();
                user.messages.push(message);
                await user.save();
                res.send('message sent successfully');
            }
        }
    }
}));

module.exports = router;