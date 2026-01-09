import express from 'express';
import { verifyClerkToken } from '../middleware/clerkAuth.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';
import {
    registerForWorkshop,
    getMyRegistrations,
    getWorkshopRegistrations,
    updateRegistrationStatus
} from '../controllers/registrationController.js';

const router = express.Router();

// User routes
router.post('/', verifyClerkToken, registerForWorkshop);
router.get('/my', verifyClerkToken, getMyRegistrations);

// Admin routes
router.get('/event/:workshopId', verifyAdminToken, getWorkshopRegistrations);
router.put('/:id/status', verifyAdminToken, updateRegistrationStatus);

export default router;
