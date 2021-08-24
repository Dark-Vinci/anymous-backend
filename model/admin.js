const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const adminSchema = new Schema({
    email: {
        type: String,
        required: true,
        minlegth: 4,
        maxlength: 200
    },

    name: {
        type: String,
        required: true,
        minlegth: 2,
        maxlength: 200
    },

    password: {
        type: String,
        required: true,
        minlegth: 5,
        maxlength: 1024
    },

    superAdmin: {
        type: Boolean,
        default: false
    }
});

adminSchema.methods.generateToken = function() {
    const token = jwt.sign({ _id: this._id, 
        superAdmin: this.superAdmin,
        isAdmin: true
    }, config.get('jwtPass'), {
        expiresIn: config.get('jwtExpires')
    });

    return token;
}

const Admin = mongoose.model('Admin', adminSchema);

function validate(inp) {
    const schema = Joi.object({
        name: Joi.string()
            .required()
            .min(2)
            .max(200),

        email: Joi.string()
            .email()
            .required(),

        password: Joi.string()
            .required()
            .min(5)
            .max(1024)
    });

    const result = schema.validate(inp);
    return result;
};

function validateLogin(inp) {
    const schema = Joi.object({
        email : Joi.string()
            .email()
            .required(),

        password: Joi.string()
            .required()
            .min(5)
            .max(1024)
    });

    const result = schema.validate(inp);
    return result;
};

function validatePass(inp) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .min(5)
            .max(1024),

        newPassword: Joi.string()
            .min(5)
            .max(1024)
    });

    const result = schema.validate(inp);
    return result;
};

module.exports = {
    Admin,
    validate,
    validateLogin,
    validatePass
}