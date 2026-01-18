import Notification from '../models/Notification.js'
import User from '../models/User.js'

// Get user notifications
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id
        const { limit = 20, unreadOnly = false } = req.query

        const query = { userId }
        if (unreadOnly === 'true') {
            query.read = false
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        const unreadCount = await Notification.countDocuments({ userId, read: false })

        res.json({ 
            success: true, 
            notifications,
            unreadCount
        })
    } catch (error) {
        console.error('Get notifications error:', error)
        res.json({ success: false, message: error.message })
    }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userId = req.user._id

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { read: true },
            { new: true }
        )

        if (!notification) {
            return res.json({ success: false, message: 'Notification non trouvée' })
        }

        res.json({ success: true, notification })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id

        await Notification.updateMany(
            { userId, read: false },
            { read: true }
        )

        res.json({ success: true, message: 'Toutes les notifications marquées comme lues' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id
        const count = await Notification.countDocuments({ userId, read: false })
        res.json({ success: true, count })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params
        const userId = req.user._id

        await Notification.findOneAndDelete({ _id: notificationId, userId })
        res.json({ success: true, message: 'Notification supprimée' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Helper function to create notification (used by other controllers)
export const createNotification = async (userId, type, title, message, link = null, data = {}) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            link,
            data
        })
        return notification
    } catch (error) {
        console.error('Create notification error:', error)
        return null
    }
}

// Admin: Get pending payments count for badge
export const getAdminStats = async (req, res) => {
    try {
        const PaymentRequest = (await import('../models/PaymentRequest.js')).default
        
        const pendingPayments = await PaymentRequest.countDocuments({ status: 'pending' })
        const unreadNotifications = await Notification.countDocuments({ 
            userId: req.user._id, 
            read: false 
        })

        res.json({ 
            success: true, 
            stats: {
                pendingPayments,
                unreadNotifications
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Educator: Get stats for badges
export const getEducatorStats = async (req, res) => {
    try {
        const Course = (await import('../models/Course.js')).default
        const Purchase = (await import('../models/Purchase.js')).default
        
        const educatorId = req.user._id
        
        // Get educator's courses
        const courses = await Course.find({ educator: educatorId })
        const courseIds = courses.map(c => c._id)
        
        // Recent enrollments (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const recentEnrollments = await Purchase.countDocuments({
            courseId: { $in: courseIds },
            status: 'completed',
            createdAt: { $gte: sevenDaysAgo }
        })
        
        const unreadNotifications = await Notification.countDocuments({ 
            userId: educatorId, 
            read: false 
        })

        res.json({ 
            success: true, 
            stats: {
                recentEnrollments,
                unreadNotifications
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
