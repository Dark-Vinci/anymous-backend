const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Home, validate, validatePut } = require('../model/homeM');
const wrap = require('../middleware/wrapper');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const val = mongoose.Types.ObjectId;
const adminWare = [ auth, admin ]

router.get('/all', adminWare, wrap( async (req, res) => {
    const homes = await Home.find();
    res.send(homes)
}));

router.get('/', wrap (async (req, res) => {
    const homes = await Home.find();
    let home;

    if (homes.length > 0) {
        for( let i = homes.length - 1; i >= 0; i-- ) {
            if (homes[i].isPublished) {
                home = homes[i];
                break;
            }
        }

        if (!home) {
            return res.send('lazy admin wont do their job, this is the home page by the way')
        } else {
            res.send(home)
        }

    } else {
        return res.send('welcome to the home page')
    }
}));

router.get('/:id', adminWare, wrap( async (req, res) => {
    const id = req.params.id;
    if ( !val.isValid(id)) {
        return res.status(404).send('doent exist man....')
    } else {
        const home = await Home.findById(id);
        if (!home) {
            return res.status(404).send('oent exist man....')
        } else {
            res.send(home)
        }
    }
}));

router.post('/', adminWare, wrap( async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(404).send(error.details[0].message)
    } else {
        const { header, body1, body2, body3, footer, isPublished } = req.body;
        const home = new Home({
            header,
            body1,
            body2,
            body3,
            footer,
            isPublished
        });

        try {
            await home.save();
            res.send(home)
        } catch(ex) {
            let message = '';

            for (field in ex.errors) {
                message += ' & ' + ex.errors[field].message;
            }

            res.status(400).send(message);
        }
    }
}));

router.delete('/:id', adminWare, wrap( async (req, res) => {
    const id = req.params.id;

    if (!val.isValid(id)) {
        return res.status(404).send('you might be lsot')
    } else {
        const home = await Home.findByIdAndRemove(id);
        if (!home) {
            return res.status(404).send('you might be lot')
        } else {
            res.send(home);
        }
    }
}));

router.put('/:id', adminWare, wrap( async (req, res) => {
    const id = req.params.id;

    if (!val.isValid(id)) {
        return res.status(404).send('youre lost man....')
    } else {
        const { error } = validatePut(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message)
        } else {
            const home = await Home.findById(id);
            if (!home) {
                return res.status(404).send('still very lost mannnn')
            } else {
                if (home.isPublished) {
                    return res.send('cant be modified at this point')
                } else {
                    let keys = Object.keys(req.body);
                    
                    for(let h of keys) {
                        home[h] = req.body[h]
                    }

                    try {
                        await home.save();
                        res.send(home);
                    } catch(ex) {
                        let message = "";
                        
                        for (field in ex.errors) {
                            message +=  ' & ' + ex.errors[field]
                        }

                        res.status(400).send(message)
                    }
                }
            }
        }
    }
}));

module.exports = router;