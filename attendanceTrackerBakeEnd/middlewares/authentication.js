const { verifyToken } = require("../service/authentication");

function checkIsAuthentic(req, res, next) {
    const token = req.cookies?.token;

    const user = verifyToken(token);

    req.user = user;
    next();
}

module.exports = {checkIsAuthentic}