import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { FloatingInput } from '../components/ui/FloatingInput';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const handleReset = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || 'Password reset successfully');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password below">
      <form onSubmit={handleReset}>
        <FloatingInput label="New Password" type="password" value={password} onChange={e => setPassword(e.target.value)} icon={Lock} required />
        <Button type="submit" variant="primary" fullWidth size="lg" icon={KeyRound} disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
