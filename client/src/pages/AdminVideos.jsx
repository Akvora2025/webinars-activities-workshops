import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminVideos.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState(null);
    const [videoFormData, setVideoFormData] = useState({
        title: '',
        embedUrl: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchVideos();
    }, [navigate]);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/videos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(response.data.videos);
            setError('');
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            setError('Failed to load videos');
        } finally {
            setLoading(false);
        }
    };

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('adminToken');

            if (editingVideo) {
                await axios.put(`${API_URL}/videos/${editingVideo._id}`, videoFormData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/videos`, videoFormData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setShowVideoForm(false);
            setEditingVideo(null);
            setVideoFormData({ title: '', embedUrl: '' });
            fetchVideos();
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to save video');
        } finally {
            setLoading(false);
        }
    };

    const handleEditVideo = (video) => {
        setEditingVideo(video);
        setVideoFormData({
            title: video.title,
            embedUrl: video.embedUrl
        });
        setShowVideoForm(true);
    };

    const handleDeleteVideo = async (videoId) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchVideos();
        } catch (error) {
            setError('Failed to delete video');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    return (
        <div className="admin-videos-page">
            <header className="admin-header">
                <div className="admin-header-content">
                    <h1>Videos Management</h1>
                    <div className="admin-user-info">
                        <span>Admin</span>
                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
                <nav className="admin-nav">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="admin-nav-btn"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="admin-nav-btn"
                    >
                        Users
                    </button>
                    <button
                        onClick={() => navigate('/admin/videos')}
                        className="admin-nav-btn active"
                    >
                        Videos
                    </button>
                    <button
                        onClick={() => navigate('/admin/announcements')}
                        className="admin-nav-btn"
                    >
                        Announcements
                    </button>
                    <button
                        onClick={() => navigate('/admin/certificates')}
                        className="admin-nav-btn"
                    >
                        Certificates
                    </button>
                </nav>
            </header>

            <main className="admin-main">
                {error && <div className="error-message">{error}</div>}

                <div className="videos-section">
                    <div className="section-header">
                        <h2>Manage Videos</h2>
                        <button
                            onClick={() => {
                                setShowVideoForm(true);
                                setEditingVideo(null);
                                setVideoFormData({ title: '', embedUrl: '' });
                            }}
                            className="create-btn"
                        >
                            Upload Video
                        </button>
                    </div>

                    <div className="videos-table-container">
                        {loading && videos.length === 0 ? (
                            <div className="loading-state">Loading videos...</div>
                        ) : videos.length === 0 ? (
                            <div className="empty-state">
                                <p>No videos uploaded yet. Click "Upload Video" to add your first video.</p>
                            </div>
                        ) : (
                            <table className="videos-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Embed URL</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {videos.map((video) => (
                                        <tr key={video._id}>
                                            <td>{video.title}</td>
                                            <td className="embed-url-cell">
                                                <code>{video.embedUrl}</code>
                                            </td>
                                            <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleEditVideo(video)}
                                                        className="edit-btn-small"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteVideo(video._id)}
                                                        className="delete-btn-small"
                                                    >
                                                        Delete
                                                    </button>
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

            {/* Video Upload/Edit Form Modal */}
            {showVideoForm && (
                <div className="modal-overlay">
                    <div className="modal-content video-modal">
                        <div className="modal-header">
                            <h2>{editingVideo ? 'Edit Video' : 'Upload Video'}</h2>
                            <button
                                onClick={() => {
                                    setShowVideoForm(false);
                                    setEditingVideo(null);
                                    setVideoFormData({ title: '', embedUrl: '' });
                                }}
                                className="close-modal"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleVideoSubmit} className="video-form">
                            <div className="form-group">
                                <label htmlFor="videoTitle">Video Title *</label>
                                <input
                                    id="videoTitle"
                                    type="text"
                                    value={videoFormData.title}
                                    onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                                    placeholder="Enter video title"
                                    required
                                    maxLength={200}
                                />
                                <small className="form-hint">Maximum 200 characters</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="videoEmbedUrl">YouTube Embed URL *</label>
                                <input
                                    id="videoEmbedUrl"
                                    type="url"
                                    value={videoFormData.embedUrl}
                                    onChange={(e) => setVideoFormData({ ...videoFormData, embedUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                    required
                                />
                                <small className="form-hint">
                                    ⚠️ Use ONLY YouTube embed URLs
                                    <br />
                                    Accepted formats:
                                    <br />
                                    • https://www.youtube.com/embed/VIDEO_ID
                                    <br />
                                    • https://www.youtube-nocookie.com/embed/VIDEO_ID
                                    <br />
                                    Do NOT use regular watch URLs (youtube.com/watch?v=...)
                                </small>
                            </div>

                            {error && <div className="error-message">{error}</div>}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowVideoForm(false);
                                        setEditingVideo(null);
                                        setVideoFormData({ title: '', embedUrl: '' });
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="submit-btn">
                                    {loading ? 'Saving...' : (editingVideo ? 'Update Video' : 'Publish Video')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminVideos;
