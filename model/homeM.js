const Joi = require('joi');
const mongoose = require('mongoose');

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

const Home = mongoose.model('Home', homeSchema);

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

module.exports.Home = Home;
module.exports.validate = validate;
module.exports.validatePut = validatePut;