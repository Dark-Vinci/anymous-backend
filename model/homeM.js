/* 
    FILE CONTAINING HOME MODEL AND VALAIDATION FUNCTION
 */

// required module
const Joi = require('joi');
const mongoose = require('mongoose');

// creating the schema which the home document would be modelled around
const homeSchema = new mongoose.Schema({
    header: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 20
    },

    body1: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 2000
    },

    body2: {
        type: String,
        minlength: 10,
        maxlength: 2000
    },

    body3: {
        type: String,
        minlength: 10,
        maxlength: 2000
    },

    footer: {
        type: String,
        minlength: 5,
        maxlength: 200
    },

    isPublished: {
        type: Boolean,
        default: false
    }
});

// the model model
const Home = mongoose.model('Home', homeSchema);

// validating function for home object creation
function validate(inp) {
    const schema = Joi.object({
        isPublished: Joi.boolean(),

        footer: Joi.string()
            .required()
            .min(5)
            .max(100),

        body1: Joi.string()
            .required()
            .min(10)
            .max(4000),

        body2: Joi.string()
            .required()
            .min(10)
            .max(4000),

        body3: Joi.string()
            .required()
            .min(10)
            .max(4000),

        header: Joi.string()
            .required()
            .min(5)
            .max(10)
    });

    const result = schema.validate(inp);
    return result;
}

// validating function for home object editing
function validatePut(inp) {
    const schema = Joi.object({
        isPublished: Joi.boolean(),

        footer: Joi.string()
            .min(5)
            .max(100),

        body1: Joi.string()
            .min(10)
            .max(4000),

        body2: Joi.string()
            .min(10)
            .max(4000),

        body3: Joi.string()
            .min(10)
            .max(4000),

        header: Joi.string()
            .min(5)
            .max(10)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Home,
    validate,
    validatePut
}