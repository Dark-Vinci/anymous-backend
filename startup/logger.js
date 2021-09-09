// MODULE FOR LOGGING ERROR AND INFORMATION ABOUT THE app
// IN THE CONSOLE, A FILE AND THE DB

const winston = require('winston');
const config = require('config');
require('winston-mongodb');

const db = config.get('db');

module.exports = function () {
    // logs info or error thrown by unexpected exceptions
    winston.exceptions.handle(
        new winston.transports.File({ filename: 'uncaughtExeptions.js'}),
        new winston.transports.Console({ prettyPrint: true, colorize: true }),
        new winston.transports.File( { filename: 'logger.log' } ) 
    )
    
    // throw error that when it catches an unhandledRejection error
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
    
    // defining the transports for winston
    winston.add( new winston.transports.File( { filename: 'logger.log' } ) );
    winston.add( new winston.transports.Console({ prettyPrint: true, colorize: true } ) );
    winston.add( new winston.transports.MongoDB({ 
        db: db,
        level: 'info'
    }));
}