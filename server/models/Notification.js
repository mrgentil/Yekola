import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['payment_request', 'payment_approved', 'payment_rejected', 'new_enrollment', 'new_earning', 'course_update', 'system'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: null
    },
    read: {
        type: Boolean,
        default: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true })

// Index pour les requêtes fréquentes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
