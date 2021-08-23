
function isAdmin(req, res, next) {
    const admin = req.user.isAdmin
    if (!admin) {
        return res.status(403).send('not authorized');
    } else {
        next();
    }
}

module.exports = isAdmin;