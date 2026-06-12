/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import API_URL from '../../config/api';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_URL + '/api/v1/notifications', { headers });
      const list = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
      setNotifications(list);
      setUnread(list.filter(n => !n.isRead).length);
    } catch (err) { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id) => {
    try { await axios.put(API_URL + '/api/v1/notifications/' + id + '/read', {}, { headers }); fetchNotifications(); }
    catch (err) { }
  };

  const markAllRead = async () => {
    try { await axios.put(API_URL + '/api/v1/notifications/read-all', {}, { headers }); fetchNotifications(); }
    catch (err) { }
  };

  const deleteNotif = async (id) => {
    try { await axios.delete(API_URL + '/api/v1/notifications/' + id, { headers }); fetchNotifications(); }
    catch (err) { }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  };

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: open ? 'var(--bg-elevated)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', position: 'relative', transition: 'var(--transition)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#ef4444',
            border: '1.5px solid var(--bg-primary)',
          }} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 320, background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)',
          zIndex: 2000, boxShadow: 'var(--shadow-lg)',
          display: 'flex', flexDirection: 'column', maxHeight: 420, overflow: 'hidden',
          animation: 'fadeInUp 0.18s ease',
        }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Notifications
              {unread > 0 && <span style={{ padding: '1px 7px', borderRadius: 'var(--radius-full)', background: '#ef444420', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>{unread}</span>}
            </div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                <Bell size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>No notifications</div>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: '11px 14px', borderBottom: '1px solid var(--border)',
                background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginTop: 5, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: n.isRead ? 500 : 700, color: 'var(--text-primary)' }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                </div>
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 4, borderRadius: 4, display: 'flex' }}>
                      <Check size={12} />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 4, display: 'flex' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
