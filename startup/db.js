const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function () {
    mongoose.connect('mongodb://localhost/secret', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true    
    })
    .then(() => winston.info('connected to the database'))
}