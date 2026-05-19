const jwt = require('jsonwebtoken');

// ACCESS TOKEN
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1m'
        }
    );
};

// REFRESH TOKEN
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '5m'
        }
    );
};

// VERIFY REFRESH TOKEN
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(
            
            token, 
            process.env.JWT_REFRESH_SECRET
        );
    } catch (error) {
        console.log("JWT ERROR:", error.message);
        return null;
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
};