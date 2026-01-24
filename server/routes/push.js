import express from 'express';
import { clerkMiddleware } from '../middleware/clerkAuth.js';
import PushSubscription from '../models/PushSubscription.js';
import { getVapidPublicKey } from '../utils/pushService.js';

const router = express.Router();

// Get VAPID public key (no auth required)
router.get('/vapid-public-key', (req, res) => {
    const publicKey = getVapidPublicKey();
    res.json({ success: true, publicKey });
});

// Subscribe to push notifications
router.post('/subscribe', clerkMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const { subscription, userAgent, deviceInfo } = req.body;

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ success: false, error: 'Invalid subscription' });
        }

        // Check if subscription already exists
        const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });

        if (existing) {
            return res.json({ success: true, message: 'Already subscribed' });
        }

        const pushSub = new PushSubscription({
            userId,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            userAgent,
            deviceInfo
        });

        await pushSub.save();

        res.json({ success: true, message: 'Subscribed to push notifications' });
    } catch (error) {
        console.error('Error subscribing to push:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', clerkMiddleware, async (req, res) => {
    try {
        const { endpoint } = req.body;

        if (!endpoint) {
            return res.status(400).json({ success: false, error: 'Endpoint required' });
        }

        await PushSubscription.removeByEndpoint(endpoint);

        res.json({ success: true, message: 'Unsubscribed from push notifications' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
