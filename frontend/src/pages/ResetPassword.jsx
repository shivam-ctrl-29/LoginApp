/* eslint-disable */
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const particles = [
  { left: '15%', delay: '1s',   dur: '12s', size: 3 },
  { left: '40%', delay: '0s',   dur: '15s', size: 2 },
  { left: '65%', delay: '2s',   dur: '10s', size: 4 },
  { left: '85%', delay: '0.5s', dur: '13s', size: 2 },
];

function ResetPassword() {
  const [password, setPassword]         = useState('');
  const [confirm, setConfirm]           = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [passFocused, setPassFocused]   = useState(false);
  const [confFocused, setConfFocused]   = useState(false);
  const { token } = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();

  const handleReset = async (e) => {
    e?.preventDefault();
    if (password.length < 6) { toast.warning('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.warning('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/v1/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/'), 1500);
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
            Set your new<br />password
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 44, lineHeight: 1.6 }}>
            Choose a strong password to keep your account safe.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              'Use at least 6 characters',
              'Mix letters, numbers & symbols',
              'Don\'t reuse old passwords',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, animation: `fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1) ${0.3 + i * 0.12}s both` }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.2)' }}>
                  <ShieldCheck size={13} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{tip}</span>
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

            <div className="auth-row-1" style={{ marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <KeyRound size={22} color="var(--accent)" strokeWidth={2} />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.02em' }}>Reset password</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Enter your new password below</p>
            </div>

            <form onSubmit={handleReset}>
              <div className="auth-row-2" style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.01em' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: passFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s ease', pointerEvents: 'none' }} />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required
                    onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
                    style={{ ...inputStyle(passFocused), padding: '0 44px 0 44px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="auth-row-3" style={{ marginBottom: 26 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7, letterSpacing: '0.01em' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: confFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s ease', pointerEvents: 'none' }} />
                  <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" required
                    onFocus={() => setConfFocused(true)} onBlur={() => setConfFocused(false)}
                    style={{ ...inputStyle(confFocused), padding: '0 44px 0 44px', borderColor: confirm && confirm !== password ? 'var(--danger)' : confFocused ? 'var(--accent)' : 'var(--border)' }}
                  />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm && confirm !== password && (
                  <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading} className="auth-row-4"
                style={{ width: '100%', height: 46, borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(99,102,241,0.45)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(99,102,241,0.3)'; }}
              >
                {loading ? (
                  <><span style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.75s linear infinite', display: 'inline-block', flexShrink: 0 }} /> Resetting...</>
                ) : (
                  <><KeyRound size={15} /> Reset Password</>
                )}
              </button>
            </form>

            <p className="auth-row-5" style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
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

export default ResetPassword;
