const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {expiresIn: '1h'});
}

module.exports = { generateToken };