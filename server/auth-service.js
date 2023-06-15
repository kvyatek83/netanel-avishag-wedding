require("dotenv").config();
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const users = [];
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

function checkRole(role) {
  return function (req, res, next) {
    if (req.userRole === role) {
      next();
    } else {
      res
        .status(403)
        .send({ auth: false, message: "Insufficient role for this action." });
    }
  };
}

module.exports = {
  verifyToken,
  checkRole,
};
