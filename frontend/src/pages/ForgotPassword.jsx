import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { FloatingInput } from '../components/ui/FloatingInput';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      toast.success(res.data.message || 'Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit}>
        <FloatingInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} required />
        <Button type="submit" variant="primary" fullWidth size="lg" icon={Send} disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: theme.colors.textSecondary }}>
        Remember your password?{' '}
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: theme.colors.accent, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

export default ForgotPassword;
