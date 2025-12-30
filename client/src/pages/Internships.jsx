import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Internships.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await axios.get(`${API_URL}/public-events?type=internship`);
      setInternships(response.data.events);
    } catch (error) {
      setError('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (internshipId) => {
    if (!isSignedIn) {
      toast.error('Please sign in to apply for internships');
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post(`${API_URL}/events/${internshipId}/register`, {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh internships to update participant count
        fetchInternships();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply for internship');
    }
  };

  const handleImageClick = (imageUrl, title) => {
    setPreviewImage({ url: imageUrl, title });
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="events-loading">
          <div className="loading-spinner"></div>
          <p>Loading internships...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="events-container">
        <div className="events-header">
          <h1>Internships</h1>
          <p>Gain real-world experience with our internship programs</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {internships.length === 0 ? (
          <div className="no-events">
            <h3>No internships available yet</h3>
            <p>Check back soon for new internship opportunities!</p>
          </div>
        ) : (
          <div className="events-grid">
            {internships.map((internship) => (
              <div key={internship._id} className="event-card">
                <div className="event-image">
                  {internship.imageUrl ? (
                    <img 
                      src={`${API_URL.replace('/api', '')}${internship.imageUrl}`} 
                      alt={internship.title}
                      onClick={() => handleImageClick(`${API_URL.replace('/api', '')}${internship.imageUrl}`, internship.title)}
                      className="event-image-clickable"
                    />
                  ) : (
                    <div className="event-placeholder">
                      <div className="event-type-badge internship">Internship</div>
                    </div>
                  )}
                </div>
                
                <div className="event-content">
                  <div className="event-header">
                    <h3>{internship.title}</h3>
                    <span className="event-price">
                      {internship.price === 0 ? 'Free' : `$${internship.price}`}
                    </span>
                  </div>
                  
                  <p className="event-description">{internship.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <strong>Start Date:</strong> {new Date(internship.date).toLocaleDateString()}
                    </div>
                    <div className="event-detail">
                      <strong>Duration:</strong> {internship.duration}
                    </div>
                    <div className="event-detail">
                      <strong>Location:</strong> {internship.location}
                    </div>
                    <div className="event-detail">
                      <strong>Supervisor:</strong> {internship.instructor}
                    </div>
                    <div className="event-detail">
                      <strong>Positions:</strong> {internship.maxParticipants || 'Multiple'}
                    </div>
                  </div>

                  {internship.tags && internship.tags.length > 0 && (
                    <div className="event-tags">
                      {internship.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="event-actions">
                    <button 
                      onClick={() => handleApply(internship._id)}
                      className="apply-btn"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {previewImage && (
        <div className="image-preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-preview" onClick={closePreview}>×</button>
            <img src={previewImage.url} alt={previewImage.title} />
            <p className="preview-title">{previewImage.title}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Internships;





