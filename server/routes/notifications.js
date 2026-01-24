import express from 'express';
import { clerkMiddleware } from '../middleware/clerkAuth.js';
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(clerkMiddleware);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

export default router;
