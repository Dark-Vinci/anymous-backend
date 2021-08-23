const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User } = require('../../../model/userM');
const config = require('config');

describe('user.generateToken', () => {
    it ('should generate valid token', () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: false
        };
        const user = new User(payload);
        const token = user.generateToken();
        const decoded = jwt.verify(token, config.get('jwtPass'));

        expect(decoded).toMatchObject(payload);
    })
})