const config = require('config');

module.exports = function () {
    if (!config.get('jwtPass')) {
        throw new Error('FATAL ERROR: jwt private key is not defined');
    }
}