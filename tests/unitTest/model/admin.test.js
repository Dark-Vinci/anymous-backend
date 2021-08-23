const mongoose  = require("mongoose");
const jwt = require('jsonwebtoken');
const { Admin } = require('../../../model/admin');
const config = require('config');


describe ('admin.test', () => {
    it ('should return a valid web token', () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true,
            isSuperAdmin: false
        }

        const admin = new Admin(payload);
        const token = admin.generateToken();
        const decoded = jwt.verify(token, config.get('jwtPass'));

        expect(decoded).toMatchObject(payload);
    })
})