import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Briefcase, BookOpen, Clock, CheckCircle, XCircle, Calendar, User, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Participated.css';

const API_URL = import.meta.env.VITE_API_URL;


export default function Participated() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('webinars');
    const [history, setHistory] = useState({ webinars: [], workshops: [], internships: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter functionality
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = await getToken();

                const res = await fetch(`${API_URL}/registrations/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch participation history');
                }

                const data = await res.json();
                if (data.success) {
                    setHistory(data.history);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load your participation history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getToken]);

    const tabs = [
        { id: 'webinars', label: 'Webinars', icon: MonitorPlay },
        { id: 'workshops', label: 'Workshops', icon: BookOpen },
        { id: 'internships', label: 'Internships', icon: Briefcase },
    ];

    const getStatusInfo = (status) => {
        const s = status?.toLowerCase();
        if (s === 'completed' || s === 'approved') return { label: 'Approved', className: 'status-approved', icon: CheckCircle };
        if (s === 'rejected') return { label: 'Rejected', className: 'status-rejected', icon: XCircle };
        if (s === 'pending') return { label: 'Pending', className: 'status-pending', icon: Clock }; // Added specific pending style
        return { label: 'Registered', className: 'status-registered', icon: Clock };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBA';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Filter logic
    const currentData = (history[activeTab] || []).filter(item => {
        if (filterStatus === 'All') return true;
        const status = item.status?.toLowerCase();
        if (filterStatus === 'Completed' && (status === 'completed' || status === 'approved')) return true;
        if (filterStatus === 'Pending' && (status === 'registered' || status === 'pending')) return true;
        return false;
    });

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Error Loading Data</div>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn-retry">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="participated-page">
            {/* Header Section */}
            <header className="page-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="page-title">Participated</h1>
                    <p className="page-subtitle">Track all your learning and activity history together.</p>
                </motion.div>

                {/* Filter */}
                <div className="filter-wrapper">
                    <div className="filter-select-container">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="All">All Status</option>
                            <option value="Completed">Completed / Approved</option>
                            <option value="Pending">Pending / Registered</option>
                        </select>
                        <div className="filter-icon">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Sticky Tabs */}
            <div className="tabs-container">
                <div className="tabs-list">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-btn ${isActive ? 'active' : ''}`}
                            >
                                <div className="tab-icon-wrapper">
                                    <tab.icon size={16} />
                                </div>
                                {tab.label}
                                <span className="tab-count">
                                    {history[tab.id]?.length || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="content-container">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentData.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon-wrapper">
                                    {(() => {
                                        const Icon = tabs.find(t => t.id === activeTab).icon;
                                        return <Icon size={40} />;
                                    })()}
                                </div>
                                <h3 className="empty-title">No {activeTab} found</h3>
                                <p className="empty-text">
                                    You haven't participated in any {activeTab} yet. Start your journey today!
                                </p>
                                <Link
                                    to={`/${activeTab}`}
                                    className="btn-explore"
                                >
                                    Explore {tabs.find(t => t.id === activeTab).label}
                                </Link>
                            </div>
                        ) : (
                            <div className="content-grid">
                                {currentData.map((item, index) => {
                                    const { className, icon: StatusIcon, label: statusLabel } = getStatusInfo(item.status);

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="history-card"
                                        >
                                            {/* Card Image Area */}
                                            <div className="card-image-area">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={`${API_URL?.replace('/api', '')}${item.imageUrl}`}
                                                        alt={item.title}
                                                        className="card-img"
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className="placeholder-img" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                                                    {activeTab === 'webinars' && <MonitorPlay size={48} />}
                                                    {activeTab === 'workshops' && <BookOpen size={48} />}
                                                    {activeTab === 'internships' && <Briefcase size={48} />}
                                                </div>

                                                {/* Category Badge */}
                                                <div className="category-badge">
                                                    {activeTab.slice(0, -1)}
                                                </div>

                                                {/* Status Badge */}
                                                <div className={`status-badge`}>
                                                    <StatusIcon size={12} className={className} strokeWidth={3} />
                                                    <span className={className}>{statusLabel}</span>
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="card-body">
                                                <h3 className="card-title">
                                                    {item.title}
                                                </h3>

                                                <div className="card-meta">
                                                    <div className="meta-item">
                                                        <Calendar size={14} />
                                                        <span>{formatDate(item.date)}</span>
                                                    </div>

                                                    <div className="meta-item">
                                                        <User size={14} />
                                                        <span>{item.instructor || 'Instructor not assigned'}</span>
                                                    </div>
                                                </div>

                                                <div className="card-actions">
                                                    {(statusLabel === 'Approved' || statusLabel === 'Completed') ? (
                                                        <>
                                                            <button className="btn-primary">
                                                                View Details
                                                            </button>
                                                            {activeTab === 'workshops' && (
                                                                <button className="btn-secondary">
                                                                    Certificate
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button className="btn-disabled">
                                                            {statusLabel}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
