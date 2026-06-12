/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarPlus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import useAuth from '../hooks/useAuth';

const STATUS_CONFIG = {
  pending:  { color: 'var(--warning)',  bg: 'var(--warning-soft)',  icon: Clock,        label: 'Pending' },
  approved: { color: 'var(--success)',  bg: 'var(--success-soft)',  icon: CheckCircle,  label: 'Approved' },
  rejected: { color: 'var(--danger)',   bg: 'var(--danger-soft)',   icon: XCircle,      label: 'Rejected' },
};

function MyLeaves() {
  const navigate = useNavigate();
  const toast = useToast();
  const { getToken, API_URL } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchLeaves(); }, []); // eslint-disable-line

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/v1/leave/my`, { headers: { Authorization: token } });
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const tabs = [
    { key: 'all', label: 'All', count: leaves.length },
    { key: 'pending', label: 'Pending', count: leaves.filter(l => l.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: leaves.filter(l => l.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: leaves.filter(l => l.status === 'rejected').length },
  ];

  const filtered = activeTab === 'all' ? leaves : leaves.filter(l => l.status === activeTab);

  if (loading) return <AppLayout><TableSkeleton rows={5} cols={4} /></AppLayout>;

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>My Leaves</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{leaves.length} application{leaves.length !== 1 ? 's' : ''} on record</p>
          </div>
          <button
            onClick={() => navigate('/leave/apply')}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: 'var(--shadow-accent)', transition: 'var(--transition)' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
          >
            <CalendarPlus size={15} /> Apply Leave
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-elevated)', padding: 4, borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--bg-surface)' : 'transparent',
                color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: activeTab === tab.key ? 600 : 400,
                transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-full)', background: activeTab === tab.key ? 'var(--accent-soft)' : 'var(--bg-elevated)', color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <Calendar size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No leave applications</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>You haven't applied for any leaves yet</div>
            <button onClick={() => navigate('/leave/apply')} style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Apply Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((leave, i) => {
              const cfg = STATUS_CONFIG[leave.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <div key={leave.id} style={{
                  background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)', padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <StatusIcon size={20} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{leave.leave_name || 'Leave'}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {formatDate(leave.from_date)} → {formatDate(leave.to_date)} · {leave.days || 0} day{(leave.days || 0) !== 1 ? 's' : ''}
                    </div>
                    {leave.reason && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>"{leave.reason}"</div>}
                  </div>
                  {leave.remarks && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, textAlign: 'right', fontStyle: 'italic' }}>"{leave.remarks}"</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default MyLeaves;
