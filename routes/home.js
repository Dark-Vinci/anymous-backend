const express = require('express');
const router = express.Router();

const { Home, validate, validatePut } = require('../model/homeM');

const bodyValidator = require('../middleware/bodyValidator');
const wrapper = require('../middleware/wrapper');
const idValidator = require('../middleware/idValidator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// route handler arrya of middleware
const adminMiddleware = [ auth, admin ]
const adminIdMiddleware = [ idValidator, auth, admin ];
const adminBodyMiddleware = [ bodyValidator(validate), auth, admin ];
const adminBodyIdValidator = [ idValidator, auth, admin, bodyValidator(validatePut) ]

// route handler for getting all home document in the db
router.get('/all-home', adminMiddleware, wrapper( async (req, res) => {
    const homes = await Home.find();

    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    })
}));

// route handler for the home page
router.get('/', wrapper ( async (req, res) => {
    const home = await Home.findOne({ isPublished: true });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: home
    });
}));

// route handler for getting a home documnet by its id
router.get('/one/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const id = req.params.id;
    const home = await Home.findById(id);

    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'home doesnt exist'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        })
    }
}));

// route handler for creating a home document
router.post('/create', adminBodyMiddleware, wrapper ( async (req, res) => {
    const { header, body1, body2, body3, footer, isPublished } = req.body;

    const home = new Home({ 
        header, body1,
        body2, body3,
        footer, isPublished
    });

    await home.save();

    res.status(201).json({
        status: 201,
        message: 'success',
        data: home
    });
}));

// route handler for deleting a home document
router.delete('/remove/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const id = req.params.id;

    const home = await Home.findByIdAndRemove(id);

    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'no home document with the id in the database'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

// route handler for editing an unpublished home document
router.put('/edit/:id', adminBodyIdValidator, wrapper ( async (req, res) => {
    const id = req.params.id;
    const home = await Home.findById(id);

    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'still very lost mannnn'
        });
    } else {
        if (home.isPublished) {
            return res.status(400).json({
                status: 400,
                message: 'cant be modified at this point'
            });
        } else {
            const { header, body1, body2, body3, footer, isPublished } = req.body;

            home.set({ 
                header: header || home.header, 
                body1: body1 || home.body1,
                body2: body2 || home.body2, 
                body3: body3 || home.body3,
                footer: footer || home.footer, 
                isPublished: isPublished || home.isPublished
            });

            await home.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: home
            });
        }
    }
}));

module.exports = router;