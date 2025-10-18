// Role-based access control middleware
export default function roleCheck(allowedRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: "Access denied. Insufficient permissions.",
          requiredRoles: allowedRoles,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ error: "Server error during authorization" });
    }
  };
}


