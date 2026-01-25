import { useState, useEffect } from 'react';
import { SignIn as ClerkSignIn, useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { calculateEventStatus, getStatusLabel } from '../utils/eventStatus';
import './Webinars.css';
import api, { setAuthToken, API_URL } from '../services/api';


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
      const response = await api.get('/public-events?type=webinar');
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
      setAuthToken(token);
      const response = await api.post(`/events/${webinarId}/register`, {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
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
        <div className="events-loading">
          <div className="loading-spinner"></div>
          <p>Loading webinars...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
                      src={`${API_URL?.replace('/api', '')}${webinar.imageUrl}`}
                      alt={webinar.title}
                      onClick={() => handleImageClick(`${API_URL?.replace('/api', '')}${webinar.imageUrl}`, webinar.title)}
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
                    <div className="event-badges">
                      <span className={`status-badge-inline ${calculateEventStatus(webinar.date, webinar.endDate)}`}>
                        {getStatusLabel(calculateEventStatus(webinar.date, webinar.endDate))}
                      </span>

                      <span className="event-price">
                        {webinar.price === 0 ? 'Free' : `$${webinar.price}`}
                      </span>
                    </div>
                  </div>


                  <p className="event-description">{webinar.description}</p>

                  <div className="event-details">
                    <div className="event-detail">
                      <strong>Start Date:</strong> {new Date(webinar.date).toLocaleDateString()}
                    </div>
                    <div className="event-detail">
                      <strong>End Date:</strong> {webinar.endDate ? new Date(webinar.endDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="event-detail">
                      <strong>Time:</strong> {new Date(webinar.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                          <div className="registered-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button className="register-btn registered" disabled>
                              ✓ Registered
                            </button>
                            {webinar.meetingLink && (
                              <a
                                href={webinar.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="register-btn"
                                style={{ textDecoration: 'none', textAlign: 'center', background: '#4f46e5' }}
                              >
                                Join Meeting
                              </a>
                            )}
                          </div>
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





