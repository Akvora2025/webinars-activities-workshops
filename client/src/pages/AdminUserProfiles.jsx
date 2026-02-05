import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Mail, Phone, Calendar, Search, X, Filter, SortAsc, RefreshCcw } from 'lucide-react';
import './AdminUsers.css'; // Reusing base styles
import api, { setAuthToken } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL;


function AdminUserProfiles() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
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
        fetchProfiles();
    }, [navigate]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            setAuthToken(token);
            const response = await api.get('/admin/user-profiles');
            if (response.data.success) {
                setProfiles(response.data.profiles);
            }

        } catch (error) {
            console.error('Failed to fetch user profiles:', error);
        } finally {
            setLoading(false);
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
        setFilters({ sortBy: 'newest' });
    };

    const filteredProfiles = profiles
        .filter(profile => {
            const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.toLowerCase();
            return (
                profile.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                profile.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                profile.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                profile.akvoraId?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                profile.certificateName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                fullName.includes(debouncedSearch.toLowerCase())
            );
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
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });

    return (
        <div className="admin-users-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>User Profiles</h1>
                    <div className="admin-user-info">
                        <span>Admin</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
                <nav className="admin-nav">
                    <button onClick={() => navigate('/admin/dashboard')} className="admin-nav-btn">Dashboard</button>
                    <button onClick={() => navigate('/admin/users')} className="admin-nav-btn">Users</button>
                    <button onClick={() => navigate('/admin/user-profiles')} className="admin-nav-btn active">User Profiles</button>
                    <button onClick={() => navigate('/admin/videos')} className="admin-nav-btn">Videos</button>
                    <button onClick={() => navigate('/admin/announcements')} className="admin-nav-btn">Announcements</button>
                    <button onClick={() => navigate('/admin/certificates')} className="admin-nav-btn">Certificates</button>
                </nav>
            </header>

            <main className="admin-main">
                <div className="users-section">
                    <div className="section-header">
                        <div className="title-group">
                            <h2>All Saved User Profiles</h2>
                            {!loading && (
                                <span className="result-count">
                                    Showing {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
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
                                <label><SortAsc size={14} /> Sort By</label>
                                <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                                    <option value="newest">Last Updated (Newest)</option>
                                    <option value="oldest">Least Recent Update</option>
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
                            <div className="loading-state">Loading user profiles...</div>
                        ) : filteredProfiles.length === 0 ? (
                            <div className="empty-state">
                                <p>No profiles found matching your search.</p>
                            </div>
                        ) : (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>AKVORA ID</th>
                                        <th>User Email</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Phone</th>
                                        <th>Name in Certificate</th>
                                        <th>Profile Created</th>
                                        <th>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProfiles.map((profile, index) => (
                                        <tr key={profile._id}>
                                            <td>{index + 1}</td>
                                            <td style={{ fontWeight: 'bold' }}>{profile.akvoraId || 'N/A'}</td>
                                            <td>
                                                <div className="flex-center gap-2">
                                                    <Mail size={14} /> {profile.email}
                                                </div>
                                            </td>
                                            <td>{profile.firstName || '-'}</td>
                                            <td>{profile.lastName || '-'}</td>
                                            <td>
                                                <div className="flex-center gap-2">
                                                    {profile.phone ? <><Phone size={14} /> {profile.phone}</> : '-'}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600', color: '#4a56e2' }}>
                                                {profile.certificateName || '-'}
                                            </td>
                                            <td>
                                                <div className="flex-center gap-2">
                                                    <Calendar size={14} /> {new Date(profile.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td>{new Date(profile.updatedAt).toLocaleDateString()}</td>
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

export default AdminUserProfiles;
