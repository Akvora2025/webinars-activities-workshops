import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendPushToAll } from '../utils/pushService.js';
import { createNotification } from './notificationController.js';

export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, durationValue, durationUnit, link } = req.body;
        const createdBy = req.admin?.email || 'admin';

        // Calculate expiry date
        const expiresAt = new Date();
        if (durationUnit === 'hours') {
            expiresAt.setHours(expiresAt.getHours() + parseInt(durationValue));
        } else if (durationUnit === 'days') {
            expiresAt.setDate(expiresAt.getDate() + parseInt(durationValue));
        }

        const announcement = new Announcement({
            title,
            message,
            link: link || '',
            durationValue,
            durationUnit,
            expiresAt,
            createdBy,
            status: 'active'
        });

        await announcement.save();

        // Create notifications for all users
        const users = await User.find({ clerkId: { $exists: true, $ne: null } }, 'clerkId');
        const notificationPromises = users.map(user =>
            createNotification(
                user.clerkId,
                'announcement',
                title,
                message,
                { expiresAt, announcementId: announcement._id, link }
            )
        );

        await Promise.allSettled(notificationPromises);

        // Send web push to all users
        await sendPushToAll({
            title: `📢 ${title}`,
            body: message,
            icon: '/logo.png',
            data: {
                type: 'announcement',
                announcementId: announcement._id,
                url: link || '/dashboard'
            }
        });

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            io.emit('announcement:new', announcement);
        }

        res.status(201).json({
            success: true,
            announcement,
            message: 'Announcement created and sent to all users'
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });

        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getActiveAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.getActive();

        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message, durationValue, durationUnit } = req.body;

        // Recalculate expiry if duration changed
        let updateData = { title, message };

        if (durationValue && durationUnit) {
            const expiresAt = new Date();
            if (durationUnit === 'hours') {
                expiresAt.setHours(expiresAt.getHours() + parseInt(durationValue));
            } else if (durationUnit === 'days') {
                expiresAt.setDate(expiresAt.getDate() + parseInt(durationValue));
            }

            updateData = { ...updateData, durationValue, durationUnit, expiresAt };
        }

        const announcement = await Announcement.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!announcement) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        res.locals.announcement = announcement;

        res.json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            return res.status(404).json({ success: false, error: 'Announcement not found' });
        }

        // Delete related notifications
        await Notification.deleteMany({ 'metadata.announcementId': id });

        // Emit socket event for deletion
        const io = req.app.get('io');
        if (io) {
            io.emit('announcement:deleted', id);
        }

        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
