

function wrap(handler) {
    return async (req, res, next) => {
        try {
            handler(req, res);
        } catch (ex) {
            console.log(err.message)
            next();
        }
    }
}

module.exports = wrap;