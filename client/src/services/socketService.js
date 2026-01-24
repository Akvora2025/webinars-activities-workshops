import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(userId) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('Socket.IO connected');
            this.connected = true;

            // Join user's personal room
            if (userId) {
                this.socket.emit('join', userId);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket.IO disconnected');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        return this.socket;
    }

    joinAdminRoom() {
        if (this.socket?.connected) {
            this.socket.emit('join-admin');
        }
    }

    // Listen for new notifications
    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification:new', callback);
        }
    }

    // Listen for announcement updates
    onAnnouncement(callback) {
        if (this.socket) {
            this.socket.on('announcement:new', callback);
            this.socket.on('announcement:updated', callback);
        }
    }

    onAnnouncementDelete(callback) {
        if (this.socket) {
            this.socket.on('announcement:deleted', callback);
        }
    }

    // Listen for registration status updates
    onRegistrationUpdate(callback) {
        if (this.socket) {
            this.socket.on('registration:status-updated', callback);
        }
    }

    // Listen for stats updates (admin)
    onStatsUpdate(callback) {
        if (this.socket) {
            this.socket.on('stats:updated', callback);
        }
    }

    // Listen for expired announcements
    onAnnouncementsExpired(callback) {
        if (this.socket) {
            this.socket.on('announcements:expired', callback);
        }
    }

    // Remove listeners
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    isConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
