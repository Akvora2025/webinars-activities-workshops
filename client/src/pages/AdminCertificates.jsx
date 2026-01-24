import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './AdminDashboard.css'; // Keep for header styles
import './AdminCertificates.css'; // New styles

function AdminCertificates() {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab based on current path
    const activeTab = location.pathname.includes('/manage') ? 'manage' : 'issue';

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Certificate Management</h1>
                    <div className="admin-user-info">
                        <span>Admin</span>
                        <button onClick={() => {
                            localStorage.removeItem('adminToken');
                            localStorage.removeItem('adminData');
                            navigate('/admin/login');
                        }} className="logout-btn">Logout</button>
                    </div>
                </div>
                <nav className="admin-nav">
                    <button onClick={() => navigate('/admin/dashboard')} className="admin-nav-btn">
                        Dashboard
                    </button>
                    <button onClick={() => navigate('/admin/videos')} className="admin-nav-btn">
                        Videos
                    </button>
                    <button onClick={() => navigate('/admin/announcements')} className="admin-nav-btn">
                        Announcements
                    </button>
                    <button onClick={() => navigate('/admin/certificates')} className="admin-nav-btn active">
                        Certificates
                    </button>
                </nav>
            </header>

            <main className="admin-main" style={{ background: '#f8f9fb' }}>
                <div className="certificates-layout-container">
                    {/* SUB NAVIGATION TABS */}
                    <div className="cert-tabs">
                        <button
                            className={`cert-tab ${activeTab === 'issue' ? 'active' : ''}`}
                            onClick={() => navigate('/admin/certificates/issue')}
                        >
                            Issue Certificate
                        </button>
                        <button
                            className={`cert-tab ${activeTab === 'manage' ? 'active' : ''}`}
                            onClick={() => navigate('/admin/certificates/manage')}
                        >
                            Manage Certificates
                        </button>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="cert-content-area">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminCertificates;
