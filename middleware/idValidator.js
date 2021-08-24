const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    const id = req.params.id;
    const valid = mongoose.Types.ObjectId;

    if (!valid.isValid(id)) {
        return res.status(404).json({
            status: 404,
            message: 'invalid object id'
        });
    } else {
        next();
    }
}