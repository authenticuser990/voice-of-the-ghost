import jwt from 'jsonwebtoken'

// JWT Authentication Middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Attach user info to request
    req.user = decoded
    
    next()
  } catch (_error) {
    console.error(_error)
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const userRole = req.user.role
    const allowedRoles = Array.isArray(roles) ? roles : [roles]

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      })
    }

    next()
  }
}