/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, logout } from '../../redux/slices/authSlice';
import { LogOut, User, ChevronDown } from 'lucide-react';
import GlobalSearch from '../ui/GlobalSearch';
import Sidebar from './Sidebar';
import NotificationBell from '../ui/NotificationBell';

const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (error) navigate('/');
  }, [error, navigate]);

  useEffect(() => {
    const handleClick = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 240, right: 0, zIndex: 900, height: 56,
        background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <GlobalSearch />
        </div>

        <NotificationBell />

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 10px 4px 4px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border)',
              background: profileOpen ? 'var(--bg-elevated)' : 'transparent',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDown size={12} color="var(--text-muted)" style={{ transform: profileOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
          </button>

          {profileOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', zIndex: 2000,
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
              animation: 'fadeInUp 0.15s ease',
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
                  </div>
                </div>
                {user?.role && (
                  <div style={{ marginTop: 8, display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {user.role}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: '6px' }}>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'var(--transition)', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <User size={14} /> My Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', color: 'var(--danger)', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'var(--transition)', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main style={{
        marginLeft: 240, padding: '76px 32px 40px',
        minHeight: '100vh', background: 'var(--gradient-glow)', backgroundAttachment: 'fixed',
      }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
