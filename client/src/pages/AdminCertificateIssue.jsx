import { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Upload,
    Search,
    CheckCircle,
    AlertCircle,
    User,
    X,
    BadgeCheck,
    Loader2,
    Type
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminCertificateIssue() {
    const [selectedYear, setSelectedYear] = useState('2025');
    const [idSuffix, setIdSuffix] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSearchedUser(null);
        setMessage(null);

        const akvoraId = `AKVORA:${selectedYear}:${idSuffix}`;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.post(`${API_URL}/certificates/check-user`,
                { akvoraId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSearchedUser(response.data.user);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'User not found');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!searchedUser || !file || !title) {
            setError('Please fill in all fields (User, Title, File)');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        const formData = new FormData();
        formData.append('akvoraId', searchedUser.akvoraId);
        formData.append('certificateTitle', title);
        formData.append('certificate', file);

        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(`${API_URL}/certificates/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage('Certificate uploaded successfully!');
            setFile(null);
            setTitle('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to upload certificate');
        } finally {
            setLoading(false);
        }
    };

    const resetSearch = () => {
        setSearchedUser(null);
        setIdSuffix('');
        setFile(null);
        setTitle('');
        setMessage(null);
        setError(null);
    };

    const validateFile = (file) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PDF, PNG or JPG.');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Max size is 5MB.');
            return false;
        }
        return true;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                setError(null);
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setError(null);
            }
        }
    };

    return (
        <div className="certificate-management-container animate-fade-in">
            {/* STEP 1: FIND USER */}
            <div className="step-section">
                <div className="step-header">
                    <h2>Step 1: Find User</h2>
                </div>

                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group compound-search-group">
                        <div className="year-select-wrapper">
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="year-select"
                                disabled={!!searchedUser}
                            >
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                        <div className="search-input-wrapper flex-grow">
                            <div className="prefix-display">AKVORA:{selectedYear}:</div>
                            <input
                                type="text"
                                placeholder="001"
                                value={idSuffix}
                                onChange={(e) => setIdSuffix(e.target.value)}
                                disabled={!!searchedUser}
                                className="search-input with-prefix"
                                required
                            />
                            {searchedUser && (
                                <button type="button" onClick={resetSearch} className="clear-search-btn" title="Clear search">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {!searchedUser && (
                        <button type="submit" className="action-btn search-btn" disabled={loading}>
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Search size={20} /> Search User</>}
                        </button>
                    )}
                </form>
            </div>

            {/* STEP 2: DETAILS & UPLOAD */}
            {searchedUser && (
                <div className="step-section animate-slide-up" style={{ marginTop: '32px' }}>
                    <div className="user-found-card">
                        <div className="user-avatar-placeholder">
                            <User size={24} />
                        </div>
                        <div className="user-info">
                            <h3>{searchedUser.firstName} {searchedUser.lastName}</h3>
                            <p>
                                <span className="user-detail-item"><CheckCircle size={14} /> {searchedUser.akvoraId}</span>
                                <span style={{ opacity: 0.5 }}>|</span>
                                <span>{searchedUser.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className="step-header">
                        <h2>Step 2: Upload Certificate</h2>
                    </div>

                    <form onSubmit={handleUpload}>
                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>
                                Certificate Title
                            </label>
                            <div className="search-input-wrapper">
                                <Type size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="e.g. Java Workshop Completion"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="search-input"
                                    maxLength={100}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div
                                className={`file-drop-zone ${file ? 'has-file' : ''} ${isDragging ? 'dragging' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="file-input-hidden"
                                />
                                <div className="upload-placeholder-content">
                                    {file ? (
                                        <div className="file-name-display">
                                            <CheckCircle size={32} />
                                            <span>{file.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={32} className={`upload-icon-large ${isDragging ? 'bounce' : ''}`} />
                                            <span style={{ fontSize: '16px', fontWeight: 500, color: '#374151' }}>
                                                {isDragging ? 'Drop file here' : 'Click to select certificate'}
                                            </span>
                                            <span className="file-formats-hint">Supported formats: PDF, PNG, JPG</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="upload-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> Uploading...</>
                            ) : (
                                <><Upload size={20} /> Upload & Issue Certificate</>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* FEEDBACK MESSAGES */}
            {message && (
                <div className="status-message success">
                    <CheckCircle size={24} />
                    <span>{message}</span>
                </div>
            )}

            {error && (
                <div className="status-message error">
                    <AlertCircle size={24} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default AdminCertificateIssue;
