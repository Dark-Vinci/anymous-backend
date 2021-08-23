

function isSuperAdmin(req, res, next) {
    const supAd = req.user.superAdmin;
    if (!supAd) {
        return res.status(403).send('not authorized');
    } else {
        next();
    }
}

module.exports = isSuperAdmin;