/* eslint-disable */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight, Building2, Users, BarChart3, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const particles = [
  { left: '10%', delay: '0s',   dur: '12s', size: 3 },
  { left: '25%', delay: '2s',   dur: '15s', size: 4 },
  { left: '45%', delay: '4s',   dur: '10s', size: 2 },
  { left: '65%', delay: '1.5s', dur: '13s', size: 3 },
  { left: '80%', delay: '3s',   dur: '11s', size: 4 },
  { left: '92%', delay: '0.5s', dur: '14s', size: 2 },
];

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) { toast.warning('Please enter email and password'); return; }
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

  const features = [
    { icon: Users,    title: 'Employee Management', desc: 'Streamline your entire workforce in one place' },
    { icon: BarChart3, title: 'Analytics & Insights', desc: 'Data-driven decisions with real-time analytics' },
    { icon: Shield,   title: 'Secure & Compliant',   desc: 'Enterprise-grade security for your HR data' },
  ];

  const inputStyle = (focused) => ({
    width: '100%', height: 46,
    borderRadius: 'var(--radius-md)',
    border: focused ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    fontSize: 14, outline: 'none',
    transition: 'border 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
    boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.2)' : 'none',
    transform: focused ? 'translateY(-1px)' : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* ── LEFT PANEL ── */}
      <div className="auth-left" style={{
        width: '45%',
        background: 'linear-gradient(-45deg, #4f46e5, #7c3aed, #a855f7, #6366f1)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
        position: 'relative',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 52px', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: -100, left: -100, background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'floatOrb 12s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', bottom: -50, right: -50, background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb2 15s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', top: '40%', left: '60%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', filter: 'blur(30px)', animation: 'floatOrb3 10s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 70%, rgba(99,102,241,0.25) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {particles.map((p, i) => (
          <div key={i} style={{ position: 'absolute', left: p.left, bottom: '-10px', width: p.size, height: p.size, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: `particleFloat ${p.dur} linear ${p.delay} infinite`, pointerEvents: 'none' }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <Building2 size={22} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>i-SOFTZONE</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.15em' }}>HRMS PLATFORM</div>
            </div>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Manage your workforce<br />intelligently
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 44, lineHeight: 1.6 }}>
            The modern HR platform trusted by forward-thinking companies to manage people, payroll, and performance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map((f, i) => (
              <div key={i}
                style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.12)', animation: `fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.12}s both`, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={17} color="#fff" strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 1 }}>{f.title}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right" style={{ width: '55%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 52px', background: 'var(--bg-primary)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div className="auth-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>

            <div className="auth-row-1" style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Sign in to your i-SOFTZONE HRMS account</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="auth-row-2" style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.01em' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: emailFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s ease', pointerEvents: 'none' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                    onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                    style={{ ...inputStyle(emailFocused), padding: '0 14px 0 44px' }}
                  />
                </div>
              </div>

              <div className="auth-row-3" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.01em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: passwordFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s ease', pointerEvents: 'none' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                    style={{ ...inputStyle(passwordFocused), padding: '0 44px 0 44px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-row-4" style={{ textAlign: 'right', marginBottom: 24 }}>
                <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', color: 'var(--text-accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="auth-row-5"
                style={{ width: '100%', height: 46, borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.45)'; e.currentTarget.style.filter = 'brightness(1.08)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)'; e.currentTarget.style.filter = ''; }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              >
                {loading ? (
                  <><span style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite', display: 'inline-block', flexShrink: 0 }} /> Signing in...</>
                ) : (
                  <><LogIn size={16} /> Sign In</>
                )}
              </button>
            </form>

            <p className="auth-row-6" style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button onClick={() => navigate('/signup')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Create account <ArrowRight size={13} />
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
