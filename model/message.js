const mongoose = require('mongoose');
const Joi = require('joi');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 250,
    },

    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const Comment = mongoose.model('Comment', commentSchema);

function validateMessage(inp) {
    const schema = Joi.object({
        content: Joi.string()
            .required()
            .min(3)
            .max(250)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports.Comment = Comment;
module.exports.commentSchema = commentSchema;
module.exports.validateMessage = validateMessage;