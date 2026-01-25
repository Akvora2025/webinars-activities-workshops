import express from 'express';
import { clerkMiddleware } from '../middleware/clerkAuth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import {
    registerForWorkshop,
    getMyRegistrations,
    getWorkshopRegistrations,
    updateRegistrationStatus,
    getUserParticipationHistory
} from '../controllers/registrationController.js';

const router = express.Router();

// User routes
router.post('/', clerkMiddleware, registerForWorkshop);
router.get('/my', clerkMiddleware, getMyRegistrations);
router.get('/history', clerkMiddleware, getUserParticipationHistory);

// Admin routes
router.get('/event/:workshopId', adminAuth, getWorkshopRegistrations);
router.put('/:id/status', adminAuth, updateRegistrationStatus);

export default router;
