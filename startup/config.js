// MODULE TO CHECK AND REPORT IF JWTKEY IS NOT DEFINED

const config = require('config');

module.exports = function () {
    if (!config.get('jwtPass')) {
        // error is thrown beacuse the jwt password id not defined
        throw new Error('FATAL ERROR: jwt private key is not defined');
    }
}