// MIDDLEWARE FOR FILTERING SUOERADMIN FROM ADMIN

function isSuperAdmin(req, res, next) {
    // getting the superAdmin property from the property 
    // defined on the request object
    const supAdmin = req.user.superAdmin;
    
    if (!supAdmin) {
        // the admin is not a super admin
        return res.status(403).json({
            status: 403,
            message: 'oga go like kill you'
        })
    } else {
        // the admin is a super admin
        // control passed to the next middleware function
        next();
    }
}

module.exports = isSuperAdmin;