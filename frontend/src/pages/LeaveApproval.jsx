// eslint-disable
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, X, MessageSquare, Filter, Calendar, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import useAuth from '../hooks/useAuth';

function LeaveApproval() {
  const navigate = useNavigate();
  const toast = useToast();
  const { getToken, API_URL, canApprove } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { // eslint-disable-line
    if (!canApprove) {
      navigate('/dashboard');
      return;
    }
    fetchLeaves();
  }, [canApprove, navigate]); // eslint-disable-line

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/v1/leave/all`, {
        headers: { Authorization: token },
      });
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id);
    const token = getToken();
    try {
      await axios.put(`${API_URL}/api/v1/leave/action/${id}`,
        { action, remarks: remarks[id] || '' },
        { headers: { Authorization: token } }
      );
      toast.success(`Leave ${action} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const filtered = statusFilter === 'all'
    ? leaves
    : leaves.filter(l => l.status === statusFilter);

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

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

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
  };

  if (loading) {
    return (
      <AppLayout>
        <TableSkeleton rows={4} cols={4} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Leave Approvals
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''} awaiting review
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '10px 20px',
                borderRadius: 20,
                border: statusFilter === status ? 'none' : '1px solid var(--border)',
                background: statusFilter === status ? 'var(--accent)' : 'var(--bg-surface)',
                color: statusFilter === status ? '#fff' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {status === 'all' ? 'All Requests' : status}
              {status === 'pending' && pendingCount > 0 && (
                <span style={{
                  marginLeft: 8,
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  borderRadius: 12,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 80,
            textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <Filter size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No leave requests match this filter</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
            {filtered.map(leave => (
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                    }}>
                      {getInitials(leave.employee_name)}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {leave.employee_name}
                      </h3>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        {leave.email}
                      </p>
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

                {/* Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  marginBottom: 20,
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Leave Type</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{leave.leave_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Total Days</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>{leave.total_days} days</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Duration</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} />
                      {formatDate(leave.from_date)} — {formatDate(leave.to_date)}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 4 }}>Reason</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{leave.reason}</div>
                  </div>
                </div>

                {/* Actions for pending */}
                {leave.status === 'pending' && (
                  <>
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                      <MessageSquare size={16} style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }} />
                      <input
                        placeholder="Add remarks (optional)"
                        value={remarks[leave.id] || ''}
                        onChange={e => setRemarks(prev => ({ ...prev, [leave.id]: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 40px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: 14,
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => handleAction(leave.id, 'approved')}
                        disabled={actionLoading === leave.id}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          background: 'var(--success)',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: actionLoading === leave.id ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'all 0.2s ease',
                          opacity: actionLoading === leave.id ? 0.7 : 1,
                        }}
                        onMouseEnter={e => actionLoading !== leave.id && (e.target.style.filter = 'brightness(1.1)')}
                        onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(leave.id, 'rejected')}
                        disabled={actionLoading === leave.id}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          background: 'var(--danger-soft)',
                          color: 'var(--danger)',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: actionLoading === leave.id ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'all 0.2s ease',
                          opacity: actionLoading === leave.id ? 0.7 : 1,
                        }}
                        onMouseEnter={e => actionLoading !== leave.id && (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default LeaveApproval;
