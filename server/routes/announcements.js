import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { clerkMiddleware } from '../middleware/clerkAuth.js';
import {
    createAnnouncement,
    getAnnouncements,
    getActiveAnnouncements,
    updateAnnouncement,
    deleteAnnouncement
} from '../controllers/announcementController.js';

const router = express.Router();

// Admin routes
router.post('/', adminAuth, createAnnouncement);
router.get('/', adminAuth, getAnnouncements);
router.put('/:id', adminAuth, updateAnnouncement);
router.delete('/:id', adminAuth, deleteAnnouncement);

// User routes
router.get('/active', clerkMiddleware, getActiveAnnouncements);

export default router;
