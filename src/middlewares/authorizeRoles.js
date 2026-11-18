// const allowedRoles = ["support_agent", "admin", "users"];

const authorizedRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // check if req.user exists
    if (!req.user)
      return res.status(401).json({ message: "Authentication required" });

    // check whether the user role is included in the allowedRoles array

    // allowedRoles.includes(req.user.role);

    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });

    next();
  };
};

export default authorizedRoles;
