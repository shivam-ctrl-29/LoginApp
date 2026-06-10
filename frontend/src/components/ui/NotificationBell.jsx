import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import API_URL from '../../config/api';

function NotificationBell() {
  const { theme } = useTheme();
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
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id) => {
    try { await axios.put(API_URL + '/api/v1/notifications/' + id + '/read', {}, { headers }); fetchNotifications(); }
    catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try { await axios.put(API_URL + '/api/v1/notifications/read-all', {}, { headers }); fetchNotifications(); }
    catch (err) { console.error(err); }
  };

  const deleteNotif = async (id) => {
    try { await axios.delete(API_URL + '/api/v1/notifications/' + id, { headers }); fetchNotifications(); }
    catch (err) { console.error(err); }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', background: 'transparent', position: 'relative' }}
      >
        <Bell size={18} />
        Notifications
        {unread > 0 && (
          <span style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 10, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8, background: theme.colors.surface || '#1e1e2e', border: '1px solid ' + theme.colors.border, borderRadius: 12, zIndex: 2000, boxShadow: '0 -8px 32px rgba(0,0,0,0.4)', maxHeight: 400, display: 'flex', flexDirection: 'column', width: 300 }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid ' + theme.colors.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.text }}>Notifications {unread > 0 && <span style={{ color: '#ef4444' }}>({unread})</span>}</div>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCheck size={13} /> All read
              </button>
            )}
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: theme.colors.textMuted, fontSize: 13 }}>No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding: '12px 14px', borderBottom: '1px solid ' + theme.colors.border, background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.08)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: n.isRead ? 500 : 700, color: theme.colors.text }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: theme.colors.textSecondary, marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 10, color: theme.colors.textMuted, marginTop: 3 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    {!n.isRead && <button onClick={() => markAsRead(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 3 }}><Check size={13} /></button>}
                    <button onClick={() => deleteNotif(n.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 3 }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
