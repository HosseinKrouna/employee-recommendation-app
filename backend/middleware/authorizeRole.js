
function authorizeRole(allowedRoles) {
  return (req, res, next) => {
   
    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next(); 
    } else {
     
      res.sendStatus(403); 
    }
  };
}

module.exports = authorizeRole;