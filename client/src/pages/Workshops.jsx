import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Workshops.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Workshops() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      const response = await axios.get(`${API_URL}/public-events?type=workshop`);
      setWorkshops(response.data.events);
    } catch (error) {
      setError('Failed to fetch workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshopId) => {
    if (!isSignedIn) {
      toast.error('Please sign in to register for workshops');
      return;
    }

    try {
      const token = await getToken();
      const response = await axios.post(`${API_URL}/events/${workshopId}/register`, {
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
        // Refresh workshops to update participant count
        fetchWorkshops();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register for workshop');
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
          <p>Loading workshops...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="events-container">
        <div className="events-header">
          <h1>Workshops</h1>
          <p>Hands-on learning experiences with expert guidance</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {workshops.length === 0 ? (
          <div className="no-events">
            <h3>No workshops scheduled yet</h3>
            <p>Check back soon for upcoming workshops!</p>
          </div>
        ) : (
          <div className="events-grid">
            {workshops.map((workshop) => (
              <div key={workshop._id} className="event-card">
                <div className="event-image">
                  {workshop.imageUrl ? (
                    <img 
                      src={`${API_URL.replace('/api', '')}${workshop.imageUrl}`} 
                      alt={workshop.title}
                      onClick={() => handleImageClick(`${API_URL.replace('/api', '')}${workshop.imageUrl}`, workshop.title)}
                      className="event-image-clickable"
                    />
                  ) : (
                    <div className="event-placeholder">
                      <div className="event-type-badge workshop">Workshop</div>
                    </div>
                  )}
                </div>
                
                <div className="event-content">
                  <div className="event-header">
                    <h3>{workshop.title}</h3>
                    <span className="event-price">
                      {workshop.price === 0 ? 'Free' : `$${workshop.price}`}
                    </span>
                  </div>
                  
                  <p className="event-description">{workshop.description}</p>
                  
                  <div className="event-details">
                    <div className="event-detail">
                      <strong>Date:</strong> {new Date(workshop.date).toLocaleDateString()}
                    </div>
                    <div className="event-detail">
                      <strong>Time:</strong> {new Date(workshop.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="event-detail">
                      <strong>Duration:</strong> {workshop.duration}
                    </div>
                    <div className="event-detail">
                      <strong>Instructor:</strong> {workshop.instructor}
                    </div>
                    <div className="event-detail">
                      <strong>Location:</strong> {workshop.location || 'Online'}
                    </div>
                  </div>

                  {workshop.tags && workshop.tags.length > 0 && (
                    <div className="event-tags">
                      {workshop.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="event-actions">
                    <button 
                      onClick={() => handleRegister(workshop._id)}
                      className="register-btn"
                    >
                      Register Now
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

export default Workshops;





