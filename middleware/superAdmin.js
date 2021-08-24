

function isSuperAdmin(req, res, next) {
    const supAdmin = req.user.superAdmin;
    
    if (!supAdmin) {
        return res.status(403).json({
            status: 403,
            message: 'oga go like kill you'
        })
    } else {
        next();
    }
}

module.exports = isSuperAdmin;