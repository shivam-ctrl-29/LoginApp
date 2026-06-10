import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Building2, Users, BarChart3, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/login`, { email, password });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      toast.success(res.data.message || 'Welcome back!');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
    }}>
      {/* Left Panel - 45% */}
      <div style={{
        width: '45%',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        overflow: 'hidden',
      }}>
        {/* Animated Orbs */}
        <div style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          top: -100,
          left: -100,
          animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          bottom: -50,
          right: -50,
          animation: 'float 10s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          top: '50%',
          right: 100,
          animation: 'float 12s ease-in-out infinite',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Building2 size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>i-SOFTZONE</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.1em' }}>HRMS</div>
            </div>
          </div>

          <h1 style={{
            fontSize: 42,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 12,
            lineHeight: 1.2,
          }}>
            Manage your workforce intelligently
          </h1>

          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: Users, title: 'Employee Management', desc: 'Streamline your team operations' },
              { icon: BarChart3, title: 'Analytics & Reports', desc: 'Data-driven insights' },
              { icon: CheckCircle, title: 'Leave Tracking', desc: 'Simplified approval workflows' },
            ].map((feature, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <feature.icon size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{feature.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - 55% */}
      <div style={{
        width: '55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        background: 'var(--bg-primary)',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
        }}>
          <h2 style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            marginBottom: 40,
          }}>
            Sign in to your i-SOFTZONE HRMS account
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 8,
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 16px 0 48px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 8,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    padding: '0 16px 0 48px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--gradient)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => !loading && (e.target.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
            >
              {loading ? 'Signing in...' : <><LogIn size={18} />Sign In</>}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: 32,
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Create account <ArrowRight size={14} />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
