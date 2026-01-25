import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
    LayoutDashboard,
    UserCircle,
    BookOpen,
    MonitorPlay,
    Briefcase,
    Award,
    Video,
    AlertCircle,
    MessageSquare,
    ChevronRight,
    Search,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Sidebar.css';

const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/profile', name: 'Profile', icon: UserCircle },
    { path: '/workshops', name: 'Workshops', icon: BookOpen },
    { path: '/webinars', name: 'Webinars', icon: MonitorPlay },
    { path: '/internships', name: 'Internships', icon: Briefcase },
    { path: '/participated', name: 'Participated', icon: Clock },
    { path: '/certificates', name: 'Certificates', icon: Award },
    { path: '/videos', name: 'Videos', icon: Video },
];

const adminItems = [
    { path: '/admin/dashboard', name: 'Admin Dashboard', icon: LayoutDashboard },
    { path: '/admin/announcements', name: 'Announcements', icon: MessageSquare },
    { path: '/admin/certificates', name: 'Certificates', icon: Award },
];

const helpItems = [
    { path: '/report-issue', name: 'Report an Issue', icon: AlertCircle },
];

function Sidebar({ isExpanded, setIsExpanded }) {
    const { user } = useUser();
    // Strict role-based check
    const isAdmin = user?.role === 'admin';

    return (
        <motion.aside
            initial={false}
            animate={{ width: isExpanded ? 260 : 80 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="sidebar-logo">
                <img src="/akvora-logo.png" alt="AKVORA" />
                <AnimatePresence>
                    {isExpanded && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            AKVORA
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={22} className="nav-icon" />
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="nav-text"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isExpanded && <ChevronRight size={16} className="arrow-icon" />}
                        </NavLink>
                    ))}
                </div>

                <div className="nav-divider" />

                {isAdmin && (
                    <div className="nav-section">
                        {isExpanded && <p className="section-title">Admin</p>}
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={22} className="nav-icon" />
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="nav-text"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isExpanded && <ChevronRight size={16} className="arrow-icon" />}
                            </NavLink>
                        ))}
                        <div className="nav-divider" />
                    </div>
                )}

                <div className="nav-section">
                    {helpItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={22} className="nav-icon" />
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="nav-text"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isExpanded && <ChevronRight size={16} className="arrow-icon" />}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {user && (
                <div className="sidebar-profile">
                    <img src={user.imageUrl} alt={user.firstName} className="user-avatar" />
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="user-details"
                            >
                                <span className="user-name">{user.firstName} {user.lastName}</span>
                                <span className="user-email">{user.primaryEmailAddress?.[0]?.emailAddress}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.aside>
    );
}

export default Sidebar;
