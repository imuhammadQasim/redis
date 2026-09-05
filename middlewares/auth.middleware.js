const jwt = require("jsonwebtoken");
const config = require("../config/config");
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, config.jwt_secret);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or Expired Token Setup" });
  }
};

module.exports = {
  authenticate,
};
