import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CalendarPlus, Calendar, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import useAuth from '../hooks/useAuth';

function MyLeaves() {
  const navigate = useNavigate();
  const toast = useToast();
  const { getToken, API_URL } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // eslint-disable-line
    fetchLeaves();
  }, []); // eslint-disable-line

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/v1/leave/my`, {
        headers: { Authorization: token },
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'approved': '#22c55e',
      'rejected': '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusBg = (status) => {
    const colors = {
      'pending': 'rgba(245,158,11,0.12)',
      'approved': 'rgba(34,197,94,0.12)',
      'rejected': 'rgba(239,68,68,0.12)',
    };
    return colors[status] || 'rgba(100,116,139,0.12)';
  };

  if (loading) {
    return (
      <AppLayout>
        <TableSkeleton rows={5} cols={6} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              My Leaves
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {leaves.length} leave application{leaves.length !== 1 ? 's' : ''} on record
            </p>
          </div>
          <button
            onClick={() => navigate('/leave/apply')}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--gradient)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
          >
            <CalendarPlus size={18} />
            Apply Leave
          </button>
        </div>

        {leaves.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 80,
            textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CalendarPlus size={28} color="var(--accent)" />
            </div>
            <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 18 }}>No leave applications yet</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
              Submit your first leave request to get started
            </p>
            <button
              onClick={() => navigate('/leave/apply')}
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--gradient)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
            >
              <CalendarPlus size={16} />
              Apply for Leave
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {leaves.map(leave => (
              <div
                key={leave.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {leave.leave_name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Clock size={12} color="var(--text-muted)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {leave.total_days} day{leave.total_days !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: getStatusBg(leave.status),
                    color: getStatusColor(leave.status),
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>
                    {leave.status}
                  </span>
                </div>

                {/* Date Range */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  marginBottom: 16,
                }}>
                  <Calendar size={16} color="var(--accent)" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {formatDate(leave.from_date)} — {formatDate(leave.to_date)}
                  </span>
                </div>

                {/* Reason */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Reason
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {leave.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default MyLeaves;
