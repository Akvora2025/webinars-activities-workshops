import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
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
import { useSocket } from '../contexts/SocketContext';
import './NotificationIcon.css';
import api, { setAuthToken } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL;


function NotificationIcon() {
    const { getToken, userId } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    // Calculate unread count from notifications array
    const { socket } = useSocket();

    // Calculate unread count from notifications array
    const unreadCount = useMemo(() => {
        return notifications.filter(n => n.isRead === false).length;
    }, [notifications]);

    useEffect(() => {
        if (userId) {
            fetchNotifications();
        }
    }, [userId]);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification:new', handleNewNotification);
        socket.on('announcement:new', handleNewAnnouncement);
        socket.on('announcement:updated', handleNewAnnouncement);
        socket.on('registration:status-updated', handleRegistrationUpdate);
        socket.on('announcement:deleted', handleAnnouncementDelete);

        return () => {
            socket.off('notification:new', handleNewNotification);
            socket.off('announcement:new', handleNewAnnouncement);
            socket.off('announcement:updated', handleNewAnnouncement);
            socket.off('registration:status-updated', handleRegistrationUpdate);
            socket.off('announcement:deleted', handleAnnouncementDelete);
        };
    }, [socket]);

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
            setAuthToken(token);
            const response = await api.get('/notifications?limit=20');
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
            setAuthToken(token);
            await api.delete(`/notifications/${id}`);

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
            setAuthToken(token);
            await api.put('/notifications/read-all', {});

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
            setAuthToken(token);
            await api.put(`/notifications/${notificationId}/read`, {});

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
