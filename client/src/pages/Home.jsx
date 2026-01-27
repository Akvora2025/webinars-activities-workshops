import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import api, { setAuthToken } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL;


function Home() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      const response = await api.get('/users/profile');


      if (response.data.success) {
        setProfileCompleted(response.data.user.profileCompleted);
        if (!response.data.user.profileCompleted) {
          // Redirect to profile if not completed
          navigate('/profile');
        }
      }
    } catch (error) {
      // If profile doesn't exist, redirect to profile page
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="home-container">
        <div className="home-content">
          <h1>Welcome to AKVORA</h1>
          <p>Your gateway to webinars, workshops, and internships.</p>

          {!profileCompleted && (
            <div className="profile-prompt">
              <p>Please complete your profile to access all features.</p>
              <button onClick={() => navigate('/profile')} className="complete-profile-btn">
                Complete Profile
              </button>
            </div>
          )}

          <div className="features-grid">
            <div className="feature-card">
              <h2>Webinars</h2>
              <p>Join our educational webinars and learn from industry experts.</p>
            </div>
            <div className="feature-card">
              <h2>Workshops</h2>
              <p>Participate in hands-on workshops to enhance your skills.</p>
            </div>
            <div className="feature-card">
              <h2>Internships</h2>
              <p>Explore internship opportunities to kickstart your career.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;





