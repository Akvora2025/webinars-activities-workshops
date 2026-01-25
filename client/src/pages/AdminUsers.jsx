import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, ShieldAlert, Trash2, Unlock, Lock, Search, X, Filter, SortAsc, RefreshCcw, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './AdminUsers.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        provider: 'all',
        status: 'all',
        sortBy: 'newest'
    });
    const navigate = useNavigate();

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (userId) => {
        if (!confirm('Are you sure you want to BLOCK this user? They will not be able to log in.')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/admin/users/${userId}/block`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User blocked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Block failed:', error);
            toast.error('Failed to block user');
        }
    };

    const handleUnblock = async (userId) => {
        if (!confirm('Are you sure you want to UNBLOCK this user?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await axios.put(`${API_URL}/admin/users/${userId}/unblock`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User unblocked successfully');
            fetchUsers();
        } catch (error) {
            console.error('Unblock failed:', error);
            toast.error('Failed to unblock user');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete user');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            provider: 'all',
            status: 'all',
            sortBy: 'newest'
        });
    };

    const filteredUsers = users
        .filter(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            const matchesSearch =
                user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                user.akvoraId?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                fullName.includes(debouncedSearch.toLowerCase());

            const matchesProvider = filters.provider === 'all' || user.authProvider === filters.provider;

            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'active' && !user.isBlocked && !user.isDeleted) ||
                (filters.status === 'blocked' && user.isBlocked && !user.isDeleted) ||
                (filters.status === 'deleted' && user.isDeleted);

            return matchesSearch && matchesProvider && matchesStatus;
        })
        .sort((a, b) => {
            switch (filters.sortBy) {
                case 'nameAZ':
                    return (a.firstName || '').localeCompare(b.firstName || '');
                case 'nameZA':
                    return (b.firstName || '').localeCompare(a.firstName || '');
                case 'idAsc':
                    return (a.akvoraId || '').localeCompare(b.akvoraId || '');
                case 'idDesc':
                    return (b.akvoraId || '').localeCompare(a.akvoraId || '');
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

    return (
        <div className="admin-users-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Users Management</h1>
                    <div className="admin-user-info">
                        <span>Admin</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
                <nav className="admin-nav">
                    <button onClick={() => navigate('/admin/dashboard')} className="admin-nav-btn">Dashboard</button>
                    <button onClick={() => navigate('/admin/users')} className="admin-nav-btn active">Users</button>
                    <button onClick={() => navigate('/admin/user-profiles')} className="admin-nav-btn">User Profiles</button>
                    <button onClick={() => navigate('/admin/videos')} className="admin-nav-btn">Videos</button>
                    <button onClick={() => navigate('/admin/announcements')} className="admin-nav-btn">Announcements</button>
                    <button onClick={() => navigate('/admin/certificates')} className="admin-nav-btn">Certificates</button>
                </nav>
            </header>

            <main className="admin-main">
                <div className="users-section">
                    <div className="section-header">
                        <div className="title-group">
                            <h2>All Registered Users</h2>
                            {!loading && (
                                <span className="result-count">
                                    Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                                </span>
                            )}
                        </div>
                        <div className="search-wrapper">
                            <div className="search-bar-modern">
                                <Search size={18} className="search-icon-modern" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, AKVORA ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        className="clear-search"
                                        onClick={() => setSearchTerm('')}
                                        title="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="filter-bar">
                        <div className="filter-group">
                            <div className="filter-item">
                                <label><Filter size={14} /> Provider</label>
                                <select name="provider" value={filters.provider} onChange={handleFilterChange}>
                                    <option value="all">All Providers</option>
                                    <option value="email">Email</option>
                                    <option value="google">Google</option>
                                    <option value="github">Github</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label><UserCheck size={14} /> Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </div>
                            <div className="filter-item">
                                <label><SortAsc size={14} /> Sort By</label>
                                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="nameAZ">Name (A-Z)</option>
                                    <option value="nameZA">Name (Z-A)</option>
                                    <option value="idAsc">AKVORA ID (Low-High)</option>
                                    <option value="idDesc">AKVORA ID (High-Low)</option>
                                </select>
                            </div>
                        </div>
                        <button className="reset-filters-btn" onClick={resetFilters}>
                            <RefreshCcw size={14} /> Reset Filters
                        </button>
                    </div>

                    <div className="users-table-container">
                        {loading ? (
                            <div className="loading-state">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="empty-state">
                                <p>No users found matching your search.</p>
                            </div>
                        ) : (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>AKVORA ID</th>
                                        <th>User Details</th>
                                        <th>Auth Provider</th>
                                        <th>Status</th>
                                        <th>Created Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user._id} className={user.isDeleted ? 'row-deleted' : ''}>
                                            <td>{index + 1}</td>
                                            <td style={{ fontWeight: '600', color: '#4f46e5' }}>
                                                {user.akvoraId || 'Assigning...'}
                                            </td>
                                            <td>
                                                <div className="user-details-cell">
                                                    <span className="user-email">{user.email}</span>
                                                    {user.firstName && <span className="user-name">{user.firstName} {user.lastName}</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="provider-badge">
                                                    {user.authProvider || 'email'}
                                                </span>
                                            </td>
                                            <td>
                                                {user.isDeleted ? (
                                                    <span className="status-badge deleted">Deleted</span>
                                                ) : user.isBlocked ? (
                                                    <span className="status-badge blocked">Blocked</span>
                                                ) : (
                                                    <span className="status-badge active">Active</span>
                                                )}
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {!user.isDeleted && (
                                                        <>
                                                            {user.isBlocked ? (
                                                                <button
                                                                    onClick={() => handleUnblock(user._id)}
                                                                    className="action-btn unblock-btn"
                                                                    title="Unblock User"
                                                                >
                                                                    <Unlock size={16} /> Unblock
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBlock(user._id)}
                                                                    className="action-btn block-btn"
                                                                    title="Block User"
                                                                >
                                                                    <Lock size={16} /> Block
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(user._id)}
                                                                className="action-btn delete-btn"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={16} /> Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminUsers;
