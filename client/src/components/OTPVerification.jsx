import { useState } from 'react';
import api from '../services/api';
import './OTPVerification.css';


const API_URL = import.meta.env.VITE_API_URL;

function OTPVerification({ email, onVerify, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      document.getElementById('otp-5')?.focus();
    }
  };

  const sendOTP = async () => {
    setSending(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-email', { email });

      if (response.data.success) {
        setOtpSent(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp: otpCode
      });


      if (response.data.success) {
        onVerify();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <h2>Verify Your Email</h2>
        <p className="otp-email">We'll send a verification code to <strong>{email}</strong></p>

        {!otpSent ? (
          <div className="otp-send-section">
            <button
              onClick={sendOTP}
              disabled={sending}
              className="send-otp-btn"
            >
              {sending ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && <div className="otp-error">{error}</div>}

            <div className="otp-actions">
              <button
                onClick={verifyOTP}
                disabled={loading || otp.join('').length !== 6}
                className="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtp(['', '', '', '', '', '']);
                  setError('');
                }}
                className="resend-otp-btn"
              >
                Resend OTP
              </button>
              {onCancel && (
                <button onClick={onCancel} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OTPVerification;





