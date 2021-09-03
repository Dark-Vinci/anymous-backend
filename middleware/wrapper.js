// MIDDLEWARE THAT CATCHES THE ERROR THROWN IN THE TRY CATCH BLOCK
// OF AN ASYNC FUNCTION AND PASSES CONTROL TO THE ERROR MIDDLEWARE

function wrapper(handler) {
    return async (req, res, next) => {
        try {
            // no error
            await handler(req, res);
        } catch (ex) {
            //conrola and error object is passed to the error middleware
            next(ex);
        }
    }
}

module.exports = wrapper;