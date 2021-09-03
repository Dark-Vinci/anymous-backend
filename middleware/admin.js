// MIDDLEWARE FOR FILTERING ADMIN FROM USERS

function isAdmin(req, res, next) {
    // get the isAdmin property
    const admin = req.user.isAdmin;

    // if the user is not an admin, the process should be terminated
    // else, control should be passed to the next middleware function
    if (!admin) {
        // the user id not an admin
        return res.status(403).json({
            status: 403,
            message: 'you are not suppose to be here'
        });
    } else {
        // the user is an admin
        next();
    }
}

module.exports = isAdmin;