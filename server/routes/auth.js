import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/verify-email', sendOTP);
router.post('/verify-otp', verifyOTP);

export default router;





