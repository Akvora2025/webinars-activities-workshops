import Notification from '../models/Notification.js';
import { sendPushToUser } from '../utils/pushService.js';

export const createNotification = async (userId, type, title, message, metadata = {}, io = null) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            metadata,
            link: metadata.link || metadata.url || '',
            expiresAt: metadata.expiresAt || null,
            relatedEvent: metadata.relatedEvent || null,
            relatedRegistration: metadata.relatedRegistration || null
        });

        await notification.save();

        // Emit Socket.IO event if io instance is provided
        if (io) {
            io.to(`user:${userId}`).emit('notification:new', {
                _id: notification._id,
                type,
                title,
                message,
                metadata,
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        // Send push notification
        await sendPushToUser(userId, {
            title,
            body: message,
            icon: '/logo.png',
            badge: '/badge.png',
            data: {
                notificationId: notification._id,
                type,
                url: metadata.url || '/'
            }
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.user;
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const query = { userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('relatedEvent', 'title type')
            .exec();

        const count = await Notification.countDocuments(query);

        res.json({
            success: true,
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.user;

        const count = await Notification.countDocuments({
            userId,
            isRead: false
        });

        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.json({ success: true, notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.user;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const notification = await Notification.findOneAndDelete({ _id: id, userId });

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
