import express from 'express'
import { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead, 
    getUnreadCount,
    deleteNotification,
    getAdminStats,
    getEducatorStats
} from '../controllers/notificationController.js'
import { authMiddleware, protectEducator } from '../middlewares/authMiddleware.js'

const notificationRouter = express.Router()

// User notifications
notificationRouter.get('/', authMiddleware, getUserNotifications)
notificationRouter.get('/unread-count', authMiddleware, getUnreadCount)
notificationRouter.put('/mark-read/:notificationId', authMiddleware, markAsRead)
notificationRouter.put('/mark-all-read', authMiddleware, markAllAsRead)
notificationRouter.delete('/:notificationId', authMiddleware, deleteNotification)

// Stats for badges
notificationRouter.get('/admin-stats', authMiddleware, protectEducator, getAdminStats)
notificationRouter.get('/educator-stats', authMiddleware, protectEducator, getEducatorStats)

export default notificationRouter
