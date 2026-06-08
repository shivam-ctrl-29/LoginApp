import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/verify-email/${token}`);
        setMessage(res.data.message);
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <AuthLayout>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
          background: isSuccess ? `${theme.colors.success}18` : `${theme.colors.info}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {loading ? (
            <Loader size={32} color={theme.colors.info} className="skeleton-shimmer" />
          ) : (
            <CheckCircle size={32} color={isSuccess ? theme.colors.success : theme.colors.danger} />
          )}
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800, color: theme.colors.text }}>
          Email Verification
        </h2>
        <p style={{ margin: 0, fontSize: 15, color: isSuccess ? theme.colors.success : theme.colors.textSecondary, lineHeight: 1.6 }}>
          {message}
        </p>
        {isSuccess && (
          <p style={{ color: theme.colors.textMuted, fontSize: 13, marginTop: 16 }}>
            Redirecting to login...
          </p>
        )}
      </div>
    </AuthLayout>
  );
}

export default VerifyEmail;
