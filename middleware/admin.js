
function isAdmin(req, res, next) {
    const admin = req.user.isAdmin;

    if (!admin) {
        return res.status(403).json({
            status: 403,
            message: 'you are not suppose to be here'
        });
    } else {
        next();
    }
}

module.exports = isAdmin;