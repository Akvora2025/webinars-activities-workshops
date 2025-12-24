import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/emailService.js';

/**
 * Generate and send OTP to email
 */
export async function sendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Hash the OTP before storing
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email, verified: false });

    // Store hashed OTP
    await OTP.create({
      email,
      otp: hashedOTP,
      expiresAt,
      verified: false
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent to email',
      expiresIn: 600 // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find the most recent unverified OTP for this email
    const otpRecord = await OTP.findOne({
      email,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}





