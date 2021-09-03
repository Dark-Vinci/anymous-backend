/* 
    FILE THAT CONTAINS ANY HOME RELATED ROUTE HANDLERS
 */


const express = require('express');
const router = express.Router();

const { Home, validate, validatePut } = require('../model/homeM');

// middlewares needed in the file
const bodyValidator = require('../middleware/bodyValidator');
const wrapper = require('../middleware/wrapper');
const idValidator = require('../middleware/idValidator');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// route handler arrya of middleware
const adminBodyIdValidator = [ 
    idValidator, auth, admin, 
    bodyValidator(validatePut) 
];
const adminBodyMiddleware = [ 
    bodyValidator(validate), auth, admin 
];
const adminMiddleware = [ auth, admin ]
const adminIdMiddleware = [ idValidator, auth, admin ];


// route handler for getting all home document in the db
router.get('/all-home', adminMiddleware, wrapper( async (req, res) => {
    // get the home document 
    const homes = await Home.find();

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: homes
    });
}));

// route handler for the home page
router.get('/', wrapper ( async (req, res) => {
    // find a published home document
    const home = await Home.findOne({ isPublished: true });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: home
    });
}));

// route handler for getting a home documnet by its id
router.get('/one/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    // define the id and find the id
    const id = req.params.id;
    const home = await Home.findById(id);

    if (!home) {
        // theres no home document with the id in the database
        return res.status(404).json({
            status: 404,
            message: 'home doesnt exist'
        });
    } else {
        // success reponse
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

// route handler for creating a home document
router.post('/create', adminBodyMiddleware, wrapper ( async (req, res) => {
    const { header, body1, body2, body3, footer, isPublished } = req.body;

    // initilize the creation of the home document
    const home = new Home({ 
        header, body1,
        body2, body3,
        footer, isPublished
    });

    // saving the created home document
    await home.save();

    // success response
    res.status(201).json({
        status: 201,
        message: 'success',
        data: home
    });
}));

// route handler for deleting a home document
router.delete('/remove/:id', adminIdMiddleware, wrapper ( async (req, res) => {
    const id = req.params.id;

    // find and remove the home document directly
    const home = await Home.findByIdAndRemove(id);

    if (!home) {
        // theres no such home document in the database
        return res.status(404).json({
            status: 404,
            message: 'no home document with the id in the database'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

// route handler for editing an unpublished home document
router.put('/edit/:id', adminBodyIdValidator, wrapper ( async (req, res) => {
    // get the id and find the home document by its id
    const id = req.params.id;
    const home = await Home.findById(id);

    if (!home) {
        // the home document wasnt found in the database
        return res.status(404).json({
            status: 404,
            message: 'still very lost mannnn'
        });
    } else {
        // if the home documnet is published, the document shouldnt be modified

        if (home.isPublished) {
            // home document had been published
            return res.status(400).json({
                status: 400,
                message: 'cant be modified at this point'
            });
        } else {
            const { header, body1, body2, body3, footer, isPublished } = req.body;

            // modify the home document
            home.set({ 
                header: header || home.header, 
                body1: body1 || home.body1,
                body2: body2 || home.body2, 
                body3: body3 || home.body3,
                footer: footer || home.footer, 
                isPublished: isPublished || home.isPublished
            });

            // save the home document
            await home.save();

            // success response
            res.status(200).json({
                status: 200,
                message: 'success',
                data: home
            });
        }
    }
}));

module.exports = router;