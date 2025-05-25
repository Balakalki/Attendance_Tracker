const jwt = require("jsonwebtoken");

const secret = "$ab03%k&b@l@";

const createToken = (user) => {
  return jwt.sign(user, secret);
};

const verifyToken = (token) => {
  if (!token) return null;
  return jwt.verify(token, secret);
};

module.exports = { createToken, verifyToken };
