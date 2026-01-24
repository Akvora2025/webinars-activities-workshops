import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['announcement', 'registration', 'approval', 'rejection', 'webinar', 'workshop', 'internship'],
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
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    relatedEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: false
    },
    relatedRegistration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkshopRegistration',
        required: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    expiresAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
