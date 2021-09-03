// MIDDLEWARE TO VALIDATE THE BODY OF A REQUEST

module.exports = function (validator) {
    return (req, res, next) => {
        // check for error
        const { error } = validator(req.body);

        if (error) {
            // when the error is truish
            return res.status(400).json({
                status: 400,
                message: error.details[0].message
            });
        } else {
            // when there is no error in the body of the request
            // control is passed to the next middleware function
            next();
        }
    }
}