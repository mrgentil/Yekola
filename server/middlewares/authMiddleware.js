import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT Authentication Middleware
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' })
        }

        const token = authHeader.substring(7)

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password')
        
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' })
        }

        // Add user info to request object
        req.user = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, error: 'Invalid token' })
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired' })
        }
        res.status(500).json({ success: false, error: 'Authentication failed' })
    }
}

// Middleware (protect educator route - also allows admin)
export const protectEducator = async (req, res, next) => {
    try {
        if (!req.user || (req.user.role !== 'educator' && req.user.role !== 'admin')) {
            return res.json({ success: false, message: "Unauthorized Access!" })
        }
        next()
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Generate JWT Token
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
}