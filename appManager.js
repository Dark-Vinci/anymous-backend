
module.exports = function (app) {
    require('./startup/logger')();
    require('./startup/db')();
    require('./startup/config')();
    require('./startup/routes')(app);
}