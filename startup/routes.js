const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
// ! here
const compression = require('compression');

const login = require('../routes/login');
const user = require('../routes/user');
const register = require('../routes/register');
const admin = require('../routes/admin');
const home = require('../routes/home');
const error = require('../middleware/error');

const corsOptions = { exposedHeaders: 'x-auth-token' }

module.exports = function (app) {
    // ! here 
    app.use(compression());
    app.use(cors(corsOptions));
    
    if (app.get('env') == 'development') {
        app.use(morgan('tiny'));
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(helmet());

    app.use('/api/login', login);
    app.use('/api/user', user);
    app.use('/api/register', register);  
    app.use('/api/home', home); 
    app.use('/api/admin', admin);  

    app.use(error);
}