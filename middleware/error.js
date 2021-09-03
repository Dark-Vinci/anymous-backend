// MIDDLEWARE THAT CATCHES ERROR THROWN IN THE 
// TRY CATCH BLCOK OF AN ASYNC HANDLER

const winston = require('winston');

function error(err, req, res, next) {
    //log the error with winston
    winston.error(err.message, err);

    // a server error response
    res.status(500).json({
        status: 500,
        message: 'something went wrong on the server'
    });
}

module.exports = error;