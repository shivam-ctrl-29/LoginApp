/* eslint-disable */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, ArrowLeft, Building2, KeyRound, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const particles = [
  { left: '12%', delay: '0s',   dur: '13s', size: 3 },
  { left: '35%', delay: '2s',   dur: '10s', size: 4 },
  { left: '58%', delay: '1s',   dur: '15s', size: 2 },
  { left: '75%', delay: '3s',   dur: '11s', size: 3 },
  { left: '90%', delay: '0.5s', dur: '14s', size: 2 },
];

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email) { toast.warning('Please enter your email'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/forgot-password`, { email });
      toast.success(res.data.message || 'Reset link sent!');
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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

  const features = [
    { icon: ShieldCheck, title: 'Secure Reset', desc: 'Token-based password reset via email' },
    { icon: Clock,       title: 'Expires in 15 min', desc: 'Reset links are valid for 15 minutes only' },
    { icon: KeyRound,    title: 'One-time use', desc: 'Each link can only be used once' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', overflow: 'hidden' }}>

      {/* LEFT PANEL */}
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

          <h1 style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Recover your<br />account securely
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 44, lineHeight: 1.6 }}>
            We'll send a secure password reset link to your registered email address.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {features.map((f, i) => (
              <div key={i}
                style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)', borderRadius: 'var(--radius-md)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.12)', animation: `fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.12}s both`, transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(8px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
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

      {/* RIGHT PANEL */}
      <div className="auth-right" style={{ width: '55%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 52px', background: 'var(--bg-primary)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div className="auth-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '40px', boxShadow: 'var(--shadow-lg)' }}>

            {!sent ? (<>
              <div className="auth-row-1" style={{ marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <KeyRound size={22} color="var(--accent)" strokeWidth={2} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>Forgot password?</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>No worries! Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="auth-row-2" style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.01em' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: emailFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s ease', pointerEvents: 'none' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                      onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                      style={{ ...inputStyle(emailFocused), padding: '0 14px 0 44px' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-row-3"
                  style={{ width: '100%', height: 46, borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)' }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.45)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)'; }}
                >
                  {loading ? (
                    <><span style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite', display: 'inline-block', flexShrink: 0 }} /> Sending...</>
                  ) : (
                    <><Send size={15} /> Send Reset Link</>
                  )}
                </button>
              </form>
            </>) : (
              <div className="auth-row-1" style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Mail size={28} color="var(--success)" strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>Check your inbox</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
                  We sent a reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. It expires in 15 minutes.
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Didn't receive it? Check spam or{' '}
                  <button onClick={() => setSent(false)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>try again</button>
                </p>
              </div>
            )}

            <p className="auth-row-4" style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: 'var(--text-secondary)' }}>
              Remember your password?{' '}
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <ArrowLeft size={13} /> Back to login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
