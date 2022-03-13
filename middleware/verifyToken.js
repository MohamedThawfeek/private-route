const jwt = require("jsonwebtoken");
const User = require("../model/user");

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    const data = await jwt.verify(token, process.env.SECRET_KEY);
    console.log(data);
    if (data !== undefined) {
      const user = await User.findById({ _id: data.userId });
      if (user.verified) {
        return res.json({ msg: "Account has been verified already" });
      } else {
        req.userId = data.userId;
        next();
      }
    } else {
      return res.status(401).json({ msg: "Access denied" });
    }
  } catch (error) {
    return res.json({ msg: "Access denied" });
  }
};

module.exports = verifyToken;
