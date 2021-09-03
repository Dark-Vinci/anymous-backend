/* 
    FILE CONTAINING ADMIN MODEL AND VALAIDATION FUNCTION
 */

// required module
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

// creating the schema which the admin document would be modelled around
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

// an instance method on the admin for generating authentication token
adminSchema.methods.generateToken = function() {
    const token = jwt.sign({ 
        _id: this._id, 
        superAdmin: this.superAdmin,
        isAdmin: true
    }, config.get('jwtPass'), {
        expiresIn: config.get('jwtExpires')
    });

    return token;
}

// the admin model
const Admin = mongoose.model('Admin', adminSchema);

// validating function for the creation of an admin
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

// validating function for logging in a user
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

// validating function for changing password
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