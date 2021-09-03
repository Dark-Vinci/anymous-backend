/* 
    FILE CONTAINING USER MODEL AND VALIDATION FUNCTION 
    FOR LOGGING, REGISTERING AND EDITING THE USER OBJECT
 */

// required file module
const mongoose = require('mongoose');
const { messageSchema } = require('./message');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('config');

// creating the schema that the user document would be molded with
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 255,
    },

    password: {
        type: String,
        minlength: 5,
        maxlength: 1024,
        required: true,
        unique: true
    },

    messages: {
        type: [ messageSchema ]
    }
});

// an instance method on the user for generating authentication token
userSchema.methods.generateToken = function () {
    const token = jwt.sign({ 
        _id: this._id, isAdmin: false 
    }, config.get('jwtPass'), {
        expiresIn: config.get('jwtExpires')
    });

    return token;
}

// the user model
const User = mongoose.model('User', userSchema);

// function to validate the creation of user
function validate(inp) {
    const schema = Joi.object({
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
}

// function to validate the logging in of a user
function validateLogin(inp) {
    const schema = Joi.object({
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
}

module.exports = {
    User,
    validate,
    validateLogin
}