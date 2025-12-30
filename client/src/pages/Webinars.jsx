import { useState, useEffect } from 'react';
import { SignIn as ClerkSignIn, useAuth, useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Webinars.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Webinars() {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      const response = await axios.get(`${API_URL}/public-events?type=webinar`);
      setWebinars(response.data.events);
    } catch (error) {
      setError('Failed to fetch webinars');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (webinarId) => {
    if (!isSignedIn) {
      toast.error('Please sign in to register for webinars');
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post(`${API_URL}/events/${webinarId}/register`, {
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
        // Refresh webinars to update participant count
        fetchWebinars();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register for webinar');
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
          <p>Loading webinars...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="events-container">
        <div className="events-header">
          <h1>Webinars</h1>
          <p>Join our live online sessions and learn from industry experts</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {webinars.length === 0 ? (
          <div className="no-events">
            <h3>No webinars scheduled yet</h3>
            <p>Check back soon for upcoming webinars!</p>
          </div>
        ) : (
          <div className="events-grid">
            {webinars.map((webinar) => (
              <div key={webinar._id} className="event-card">
                <div className="event-image">
                  {webinar.imageUrl ? (
                    <img 
                      src={`${API_URL.replace('/api', '')}${webinar.imageUrl}`} 
                      alt={webinar.title}
                      onClick={() => handleImageClick(`${API_URL.replace('/api', '')}${webinar.imageUrl}`, webinar.title)}
                      className="event-image-clickable"
                    />
                  ) : (
                    <div className="event-placeholder">
                      <div className="event-type-badge webinar">Webinar</div>
                    </div>
                  )}
                </div>
                
                <div className="event-content">
                  <div className="event-header">
                    <h3>{webinar.title}</h3>
                    <span className="event-price">
                      {webinar.price === 0 ? 'Free' : `$${webinar.price}`}
                    </span>
                  </div>
                  
                  <p className="event-description">{webinar.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <strong>Date:</strong> {new Date(webinar.date).toLocaleDateString()}
                    </div>
                    <div className="event-detail">
                      <strong>Time:</strong> {new Date(webinar.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="event-detail">
                      <strong>Duration:</strong> {webinar.duration}
                    </div>
                    <div className="event-detail">
                      <strong>Instructor:</strong> {webinar.instructor}
                    </div>
                    <div className="event-detail">
                      <strong>Participants:</strong> {webinar.participants?.length || 0} enrolled
                    </div>
                  </div>

                  {webinar.tags && webinar.tags.length > 0 && (
                    <div className="event-tags">
                      {webinar.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="event-actions">
                    {(() => {
                      const isRegistered = webinar.participants?.some(
                        participant => participant.userId === user?.id
                      );
                      
                      if (!isSignedIn) {
                        return (
                          <button 
                            className="register-btn"
                            onClick={() => toast.error('Please sign in to register')}
                          >
                            Sign In to Register
                          </button>
                        );
                      } else if (isRegistered) {
                        return (
                          <button className="register-btn registered" disabled>
                            ✓ Registered
                          </button>
                        );
                      } else {
                        return (
                          <button 
                            className="register-btn"
                            onClick={() => handleRegister(webinar._id)}
                          >
                            Register Now
                          </button>
                        );
                      }
                    })()}
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

export default Webinars;





