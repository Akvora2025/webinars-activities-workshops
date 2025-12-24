import { useState, useEffect } from 'react';
import { SignIn as ClerkSignIn, useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import OTPVerification from '../components/OTPVerification';
import axios from 'axios';
import './SignIn.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function SignIn() {
  const { isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [showOTP, setShowOTP] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      checkProfileStatus();
    }
  }, [isSignedIn, userId]);

  const checkProfileStatus = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProfileCompleted(response.data.user.profileCompleted);
        if (response.data.user.profileCompleted) {
          navigate('/');
        } else {
          navigate('/profile');
        }
      }
    } catch (error) {
      // User doesn't have a profile yet, show OTP verification
      if (isSignedIn && user) {
        const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || '';
        if (email) {
          setUserEmail(email);
          setShowOTP(true);
        } else {
          // If no email, go directly to profile
          navigate('/profile');
        }
      }
    }
  };

  const handleOTPVerify = async () => {
    setShowOTP(false);
    // Redirect to profile page after OTP verification
    navigate('/profile');
  };

  if (isSignedIn && !showOTP) {
    return null; // Will redirect
  }

  return (
    <div className="sign-in-container">
      {!showOTP ? (
        <div className="sign-in-box">
          <h1>Welcome to AKVORA</h1>
          <ClerkSignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/profile"
            afterSignInUrl="/profile"
            afterSignUpUrl="/profile"
          />
        </div>
      ) : (
        <OTPVerification 
          email={userEmail}
          onVerify={handleOTPVerify}
          onCancel={() => {
            setShowOTP(false);
            // User can proceed to profile without OTP verification
            navigate('/profile');
          }}
        />
      )}
    </div>
  );
}

export default SignIn;

