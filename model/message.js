/* 
    FILE CONTAINING MESSAGE MODEL AND VALAIDATION FUNCTION
 */

// required file module
const mongoose = require('mongoose');
const Joi = require('joi');

// creating the schema which the message document would be modelled around
const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 250,
    },

    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// the comment model
const Comment = mongoose.model('Comment', commentSchema);

// validating the creation of the comment
function validateMessage(inp) {
    const schema = Joi.object({
        content: Joi.string()
            .required()
            .min(1)
            .max(250)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Comment,
    commentSchema,
    validateMessage
}