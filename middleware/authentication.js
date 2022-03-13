const jwt = require("jsonwebtoken");

const authentication = async (req, res, next) => {
  try {
    const token = await req.headers["authorization"];
    const data = await jwt.verify(token, process.env.SECRET_KEY);
    req.userId = data.userId;
    req.loginType = data.loginType;
    next();
  } catch (error) {
    return res.json({ msg: "Access denied" });
  }
};

module.exports = authentication;
