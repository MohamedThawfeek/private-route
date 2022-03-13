const permit = (allowed) => {
  const isAllowed = (role) => allowed.indexOf(role) > -1;

  return (req, res, next) => {
    if (req.loginType && isAllowed(req.loginType)) {
      next();
    } else {
      return res.json({ mgs: "Not authorized" });
    }
  };
};

module.exports = permit;
