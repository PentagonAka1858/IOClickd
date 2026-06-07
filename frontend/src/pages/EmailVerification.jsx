import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Auth.scss';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const id = searchParams.get('id');
      const hash = searchParams.get('hash');

      if (!id || !hash) {
        setError('Invalid verification link. Please check your email again.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/email/verify/${id}/${hash}`);
        setVerified(true);
        setUser(response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification failed. Link may have expired.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="verification-loading">
            <div className="spinner"></div>
            <h2>Verifying your email...</h2>
            <p>Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>Your email address has been successfully verified.</p>
            <p className="verified-email">{user?.email}</p>
            <p className="verification-text">You can now access all features of the application.</p>
            <Link to="/login" className="btn btn-primary btn-block">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="verification-error">
          <div className="error-icon">✕</div>
          <h2>Verification Failed</h2>
          <p className="error-message">{error}</p>
          <div className="verification-actions">
            <Link to="/resend-verification" className="btn btn-secondary btn-block">
              Resend Verification Email
            </Link>
            <Link to="/login" className="btn btn-outline btn-block">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
