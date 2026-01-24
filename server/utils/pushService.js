import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

// Generate VAPID keys if not set (run this once and save to .env)
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log('Public Key:', vapidKeys.publicKey);
// console.log('Private Key:', vapidKeys.privateKey);

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@akvora.com';

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

export const sendPushNotification = async (subscription, payload) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return { success: true };
    } catch (error) {
        console.error('Push notification error:', error);

        // Remove invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.removeByEndpoint(subscription.endpoint);
        }

        return { success: false, error: error.message };
    }
};

export const sendPushToUser = async (userId, payload) => {
    try {
        const subscriptions = await PushSubscription.getUserSubscriptions(userId);

        const results = await Promise.allSettled(
            subscriptions.map(sub =>
                sendPushNotification({
                    endpoint: sub.endpoint,
                    keys: sub.keys
                }, payload)
            )
        );

        return {
            success: true,
            sent: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length
        };
    } catch (error) {
        console.error('Error sending push to user:', error);
        return { success: false, error: error.message };
    }
};

export const sendPushToAll = async (payload) => {
    try {
        const allSubscriptions = await PushSubscription.find({});

        const results = await Promise.allSettled(
            allSubscriptions.map(sub =>
                sendPushNotification({
                    endpoint: sub.endpoint,
                    keys: sub.keys
                }, payload)
            )
        );

        return {
            success: true,
            sent: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length
        };
    } catch (error) {
        console.error('Error sending push to all:', error);
        return { success: false, error: error.message };
    }
};

export const getVapidPublicKey = () => vapidPublicKey;
