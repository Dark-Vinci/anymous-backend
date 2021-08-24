const winston = require('winston');

function error(err, req, res, next) {
    winston.error(err.message, err)

    res.status(500).json({
        status: 500,
        message: 'something went wrong on the server'
    })
}

module.exports = error;