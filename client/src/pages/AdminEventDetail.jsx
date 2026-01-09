import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminEventDetail.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminEventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [registrations, setRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvent(response.data.event);
            if (response.data.event.type === 'workshop') {
                fetchRegistrations();
            }
        } catch (error) {
            console.error('Failed to fetch event:', error);
            setError('Event not found or unauthorized');
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrations = async () => {
        setLoadingRegistrations(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/registrations/event/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistrations(response.data.registrations);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
        } finally {
            setLoadingRegistrations(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const handleUpdateRegistrationStatus = async (regId, status) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(`${API_URL}/registrations/${regId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setRegistrations(prev => prev.map(reg =>
                    reg._id === regId ? { ...reg, status } : reg
                ));
                fetchEventDetails(); // Refresh participants list
                toast.success(`Registration ${status} successfully`);
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="admin-loading">Loading event details...</div>;
    if (error) return <div className="admin-error">{error} <button onClick={() => navigate('/admin/dashboard')}>Back</button></div>;
    if (!event) return null;

    return (
        <div className="admin-detail-page">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>← Back to Dashboard</button>
                <div className="header-main">
                    <h1>{event.title}</h1>
                    <span className={`event-type-badge ${event.type}`}>{event.type}</span>
                </div>
            </header>

            <div className="detail-grid">
                <section className="detail-info-card">
                    <div className="info-section">
                        <img
                            src={event.imageUrl ? `${API_URL.replace('/api', '')}${event.imageUrl}` : '/placeholder.jpg'}
                            alt={event.title}
                            className="detail-img"
                        />
                        <div className="info-content">
                            <h3>Event Information</h3>
                            <p><strong>Description:</strong> {event.description}</p>
                            <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
                            <p><strong>Instructor:</strong> {event.instructor}</p>
                            <p><strong>Location:</strong> {event.location || 'Online'}</p>
                            <p><strong>Price:</strong> ₹{event.price}</p>
                            <p><strong>Status:</strong> <span className={`status-${event.status}`}>{event.status}</span></p>

                            <div className="detail-actions">
                                <button className="edit-btn-main" onClick={() => navigate(`/admin/dashboard`, { state: { editEvent: event } })}>Edit Event</button>
                                <button className="delete-btn-main" onClick={handleDelete}>Delete Event</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="participants-section">
                    <h3>Current Participants ({event.participants?.length || 0})</h3>
                    <div className="participants-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Registered At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {event.participants?.map((p, i) => (
                                    <tr key={i}>
                                        <td>{p.name}</td>
                                        <td>{p.email}</td>
                                        <td>{new Date(p.registeredAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {(!event.participants || event.participants.length === 0) && (
                                    <tr><td colSpan="3" className="no-data">No participants yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {event.type === 'workshop' && (
                    <section className="registrations-verification-section">
                        <h3>Verify Workshop Registrations</h3>
                        <div className="table-responsive">
                            <table className="registrations-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>UPI Reference</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((reg) => (
                                        <tr key={reg._id}>
                                            <td>
                                                <div className="student-info">
                                                    <strong>{reg.user.firstName} {reg.user.lastName}</strong>
                                                    <small>{reg.user.akvoraId}</small>
                                                </div>
                                            </td>
                                            <td><code>{reg.upiReference}</code></td>
                                            <td><span className={`status-badge ${reg.status}`}>{reg.status}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    {reg.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleUpdateRegistrationStatus(reg._id, 'approved')} className="approve-btn">Approve</button>
                                                            <button onClick={() => handleUpdateRegistrationStatus(reg._id, 'rejected')} className="reject-btn">Reject</button>
                                                        </>
                                                    )}
                                                    {reg.status !== 'pending' && (
                                                        <button onClick={() => handleUpdateRegistrationStatus(reg._id, 'pending')} className="reset-btn">Reset</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {registrations.length === 0 && (
                                        <tr><td colSpan="4" className="no-data">No registration requests found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default AdminEventDetail;
