import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import {
    Bell,
    Megaphone,
    CheckCircle,
    XCircle,
    FileText,
    ExternalLink,
    Calendar,
    Award
} from 'lucide-react';
import socketService from '../services/socketService';
import './NotificationIcon.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function NotificationIcon() {
    const { getToken, userId } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    // Calculate unread count from notifications array
    const unreadCount = useMemo(() => {
        return notifications.filter(n => n.isRead === false).length;
    }, [notifications]);

    useEffect(() => {
        if (userId) {
            // Fetch notifications on mount
            fetchNotifications();

            // Connect to Socket.IO
            socketService.connect(userId);

            // Listen for events
            socketService.onNotification(handleNewNotification);
            socketService.onAnnouncement(handleNewAnnouncement);
            socketService.onRegistrationUpdate(handleRegistrationUpdate);
            socketService.onAnnouncementDelete(handleAnnouncementDelete);

            return () => {
                socketService.off('notification:new', handleNewNotification);
                socketService.off('announcement:new', handleNewAnnouncement);
                socketService.off('announcement:updated', handleNewAnnouncement);
                socketService.off('registration:status-updated', handleRegistrationUpdate);
                socketService.off('announcement:deleted', handleAnnouncementDelete);
            };
        }
    }, [userId]);

    // Close panel when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowPanel(false);
            }
        }

        if (showPanel) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showPanel]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/notifications?limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewNotification = () => fetchNotifications();
    const handleNewAnnouncement = () => fetchNotifications();
    const handleRegistrationUpdate = () => fetchNotifications();

    const handleAnnouncementDelete = (announcementId) => {
        // Remove notifications related to this announcement instantly
        setNotifications(prev => prev.filter(n => {
            // Check metadata for announcementId
            return n.metadata?.announcementId !== announcementId;
        }));
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent triggering markAsRead or other click events

        // Optimistic update
        setNotifications(prev => prev.filter(n => n._id !== id));

        try {
            const token = await getToken();
            await axios.delete(`${API_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            // Optionally revert state here if needed, but for notifications it's usually fine
        }
    };

    const handleIconClick = async () => {
        const wasOpen = showPanel;
        setShowPanel(!showPanel);

        if (!wasOpen) {
            // When opening, fetch (optional) and mark visible as read if desired, 
            // but user req says "When user opens notifications: Mark them as read."
            await fetchNotifications();
            markAllListAsRead();
        }
    };

    // Helper to mark visible notifications as read locally and on server
    const markAllListAsRead = async () => {
        // Optimistically update local state
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        try {
            const token = await getToken();
            await axios.put(
                `${API_URL}/notifications/read-all`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );

        try {
            const token = await getToken();
            await axios.put(
                `${API_URL}/notifications/${notificationId}/read`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'announcement':
                return <Megaphone size={18} className="icon-announcement" />;
            case 'approval':
                return <CheckCircle size={18} className="icon-success" />;
            case 'rejection':
                return <XCircle size={18} className="icon-danger" />;
            case 'registration':
                return <FileText size={18} className="icon-info" />;
            case 'certificate':
                return <Award size={18} className="icon-gold" />;
            case 'webinar':
            case 'workshop':
            case 'internship':
                return <Calendar size={18} className="icon-primary" />;
            default:
                return <Bell size={18} className="icon-default" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    return (
        <div className="notification-icon-container" ref={panelRef}>
            <button className="notification-icon-btn" onClick={handleIconClick}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {showPanel && (
                <div className="notification-panel">
                    <div className="notification-panel-header">
                        <h3>Notifications</h3>
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <Bell size={48} className="empty-icon" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                    <div className="notification-icon-wrapper">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>

                                        {notification.link && (
                                            <a
                                                href={notification.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="notification-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink size={12} />
                                                Visit Link
                                            </a>
                                        )}

                                        <span className="notification-time">{formatTime(notification.createdAt)}</span>
                                    </div>
                                    <button
                                        className="notification-delete-btn"
                                        onClick={(e) => handleDelete(e, notification._id)}
                                        title="Delete notification"
                                    >
                                        <XCircle size={14} />
                                    </button>
                                    {!notification.isRead && <div className="notification-unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationIcon;
