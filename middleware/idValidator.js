// MIDDLEWARE TO VALIDATE IF AN ID PASSED IN THE URL
// IS A VALID MONGOOSE OBJECTID

const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    // extract the id from the request object
    const id = req.params.id;
    const valid = mongoose.Types.ObjectId;

    if (!valid.isValid(id)) {
        // the id appears to be an invalid obejct id
        return res.status(404).json({
            status: 404,
            message: 'invalid object id'
        });
    } else {
        // the object id is valid, control is passed to
        // to the next middleware in the (req, res) pipeline
        next();
    }
}