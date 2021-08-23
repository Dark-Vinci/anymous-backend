const winston = require('winston');
require('winston-mongodb');

module.exports = function () {
    winston.exceptions.handle(
        new winston.transports.File({ filename: 'uncaughtExeptions.js'}),
        new winston.transports.Console({ prettyPrint: true, colorize: true }),
        new winston.transports.File( { filename: 'logger.log' } ) 
    )
    
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
    
    winston.add( new winston.transports.File( { filename: 'logger.log' } ) );
    winston.add( new winston.transports.Console({ prettyPrint: true, colorize: true } ) );
    winston.add( new winston.transports.MongoDB({ 
        db: "mongodb://localhost/secret",
        level: 'info'
    }));
}