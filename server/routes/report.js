import express from 'express';
import nodemailer from 'nodemailer';
import { clerkMiddleware } from '../middleware/clerkAuth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * @route   POST /api/report-issue
 * @desc    Report an issue and send email to Akvora team
 * @access  Private
 */
router.post('/', clerkMiddleware, async (req, res) => {
    const { issue } = req.body;
    const { clerkUser, clerkEmail } = req;

    if (!issue || issue.trim() === '') {
        return res.status(400).json({ error: 'Issue description is required' });
    }

    const userName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const mailOptions = {
        from: `"${userName}" <${clerkEmail}>`, // Appears as user in inbox
        to: 'contactakvora@gmail.com',
        replyTo: clerkEmail,
        subject: `New Issue Reported by ${userName}`,
        text: `
            New issue reported in AKVORA platform.
            
            User Details:
            - Name: ${userName}
            - Email: ${clerkEmail}
            - Submitted Date: ${timestamp}
            
            Issue Description:
            ${issue}
            
            ---
            This email was generated automatically from the AKVORA Issue Reporting system.
        `,
        html: `
            <h3>New Issue Reported</h3>
            <p><strong>User:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${clerkEmail}</p>
            <p><strong>Submitted Date:</strong> ${timestamp}</p>
            <hr />
            <h4>Issue Description:</h4>
            <p style="white-space: pre-wrap;">${issue}</p>
            <br />
            <p style="font-size: 0.8em; color: #666;">This email was generated automatically from the AKVORA Issue Reporting system.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Your issue has been sent to the Akvora team.' });
    } catch (error) {
        console.error('Nodemailer Error:', error);
        res.status(500).json({ error: 'Failed to send issue report. Please try again later.' });
    }
});

export default router;
