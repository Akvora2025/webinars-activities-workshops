import api, { setAuthToken } from './api';

const API_URL = import.meta.env.VITE_API_URL;


class PushService {
    constructor() {
        this.vapidPublicKey = null;
        this.subscription = null;
    }

    // Check if push notifications are supported
    isSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    }

    // Get notification permission status
    getPermissionStatus() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission;
    }

    // Request notification permission
    async requestPermission() {
        if (!this.isSupported()) {
            throw new Error('Push notifications are not supported');
        }

        const permission = await Notification.requestPermission();
        return permission;
    }

    // Get VAPID public key from server
    async getVapidPublicKey() {
        if (this.vapidPublicKey) return this.vapidPublicKey;

        try {
            const response = await api.get('/push/vapid-public-key');

            this.vapidPublicKey = response.data.publicKey;
            return this.vapidPublicKey;
        } catch (error) {
            console.error('Error fetching VAPID key:', error);
            throw error;
        }
    }

    // Register service worker
    async registerServiceWorker() {
        if (!this.isSupported()) {
            throw new Error('Service workers are not supported');
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            throw error;
        }
    }

    // Subscribe to push notifications
    async subscribe(token) {
        try {
            // Check permission
            const permission = await this.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            // Register service worker
            const registration = await this.registerServiceWorker();

            // Get VAPID public key
            const vapidPublicKey = await this.getVapidPublicKey();

            // Convert VAPID key to Uint8Array
            const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            this.subscription = subscription;

            // Send subscription to server
            setAuthToken(token);
            await api.post(
                '/push/subscribe',
                {
                    subscription: subscription.toJSON(),
                    userAgent: navigator.userAgent,
                    deviceInfo: this.getDeviceInfo()
                }
            );


            console.log('Push subscription successful');
            return subscription;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            throw error;
        }
    }

    // Unsubscribe from push notifications
    async unsubscribe(token) {
        try {
            if (!this.subscription) {
                const registration = await navigator.serviceWorker.ready;
                this.subscription = await registration.pushManager.getSubscription();
            }

            if (this.subscription) {
                await this.subscription.unsubscribe();

                // Notify server
                setAuthToken(token);
                await api.post(
                    '/push/unsubscribe',
                    { endpoint: this.subscription.endpoint }
                );


                this.subscription = null;
                console.log('Push unsubscription successful');
            }
        } catch (error) {
            console.error('Error unsubscribing from push:', error);
            throw error;
        }
    }

    // Helper: Convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Get device info
    getDeviceInfo() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'Mobile';
        if (/tablet/i.test(ua)) return 'Tablet';
        return 'Desktop';
    }
}

// Export singleton instance
const pushService = new PushService();
export default pushService;
