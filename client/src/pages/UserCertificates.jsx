import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { Download, Award, Calendar, Eye, Search, X } from 'lucide-react';
import './UserCertificates.css';

const API_URL = import.meta.env.VITE_API_URL;

function UserCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();
    const [error, setError] = useState(null);
    const [viewingCert, setViewingCert] = useState(null);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${API_URL}/certificates/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCertificates(response.data.certificates);
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setError('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (cert) => {
        // Build full URL
        const url = `${API_URL.replace('/api', '')}${cert.certificateUrl}`;

        // Mobile behavior: Open in new tab
        if (window.innerWidth < 768) {
            window.open(url, '_blank');
            return;
        }

        // Desktop: Open modal preview
        setViewingCert({
            ...cert,
            fullUrl: url
        });
    };

    const filteredCertificates = certificates.filter(cert => {
        const title = cert.certificateTitle || cert.eventId?.title || 'Achievement Certificate';
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) return <div className="loading">Loading certificates...</div>;

    return (
        <div className="certificates-page">
            <div className="page-header">
                <h1>My Certificates</h1>
                <p>Verify and download your earned achievements</p>
            </div>

            <div className="certificates-search-container" style={{ maxWidth: '600px', margin: '0 0 2rem 0', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                    type="text"
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 12px 12px 48px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>

            {filteredCertificates.length === 0 ? (
                <div className="no-certificates">
                    <Award size={48} className="placeholder-icon" />
                    <h3>{searchTerm ? `No certificates found matching "${searchTerm}"` : 'No certificates yet'}</h3>
                    {!searchTerm && <p>Complete workshops and events to earn certificates!</p>}
                </div>
            ) : (
                <div className="certificates-grid">
                    {filteredCertificates.map((cert) => (
                        <div key={cert._id} className="certificate-card">
                            <div className="certificate-preview" onClick={() => handleView(cert)}>
                                {cert.certificateUrl.endsWith('.pdf') ? (
                                    <div className="pdf-preview">
                                        <Award size={40} />
                                        <span>PDF Document</span>
                                    </div>
                                ) : (
                                    <img src={`${API_URL.replace('/api', '')}${cert.certificateUrl}`} alt="Certificate" />
                                )}

                            </div>
                            <div className="certificate-info">
                                <h3 title={cert.certificateTitle || cert.eventId?.title}>{cert.certificateTitle || cert.eventId?.title || 'Achievement Certificate'}</h3>
                                <div className="certificate-meta">
                                    <span><Calendar size={14} /> Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="certificate-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    <button
                                        onClick={() => handleView(cert)}
                                        className="view-btn"
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            background: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                    <a
                                        href={`${API_URL.replace('/api', '')}${cert.certificateUrl}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="download-btn"
                                        style={{ flex: 1 }}
                                    >
                                        <Download size={16} /> Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PREVIEW MODAL */}
            {viewingCert && (
                <div className="modal-overlay" onClick={() => setViewingCert(null)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', pading: '20px'
                }}>
                    <div className="preview-modal-content" onClick={e => e.stopPropagation()} style={{
                        background: 'transparent', maxWidth: '90vw', maxHeight: '90vh', position: 'relative'
                    }}>
                        <button onClick={() => setViewingCert(null)} style={{
                            position: 'absolute', top: '-40px', right: 0,
                            background: 'none', border: 'none', color: 'white', cursor: 'pointer'
                        }}>
                            <X size={32} />
                        </button>

                        {viewingCert.certificateUrl.endsWith('.pdf') ? (
                            <iframe
                                src={viewingCert.fullUrl}
                                style={{ width: '80vw', height: '80vh', border: 'none', background: 'white', borderRadius: '8px' }}
                                title="Certificate Preview"
                            />
                        ) : (
                            <img
                                src={viewingCert.fullUrl}
                                alt="Certificate Full View"
                                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                            />
                        )}

                        <div style={{ textAlign: 'center', marginTop: '16px' }}>
                            <a
                                href={viewingCert.fullUrl}
                                download
                                className="download-btn"
                                style={{ display: 'inline-flex', padding: '10px 24px', fontSize: '16px' }}
                            >
                                <Download size={20} /> Download Original
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserCertificates;
