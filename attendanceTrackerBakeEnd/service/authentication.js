const jwt = require("jsonwebtoken");

const secret = process.env.SECRET;

const createToken = (user) => {
  if(!user.isVerified) return null;
  return jwt.sign(user, secret);
};

const verifyToken = (token) => {
  if (!token) return null;
  return jwt.verify(token, secret);
};

module.exports = { createToken, verifyToken };
