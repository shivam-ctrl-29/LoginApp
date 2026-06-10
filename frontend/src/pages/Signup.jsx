import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { FloatingInput } from '../components/ui/FloatingInput';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/signup`, { name, email, password });
      toast.success(res.data.message || 'Account created successfully!');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join i-SOFTZONE HRMS and manage your workforce">
      <form onSubmit={handleSignup}>
        <FloatingInput
          label="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          icon={User}
          required
        />
        <FloatingInput
          label="Email Address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={Mail}
          required
        />
        <FloatingInput
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon={Lock}
          required
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          icon={UserPlus}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: 28,
        fontSize: 14,
        color: theme.colors.textSecondary,
      }}>
        Already have an account?{' '}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            color: theme.colors.accent,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowLeft size={14} /> Sign in
        </button>
      </p>
    </AuthLayout>
  );
}

export default Signup;
