
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user._id ,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '5h'
        }
    );
};

const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};