/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, X, MessageSquare, Calendar, Clock, Users } from 'lucide-react';
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
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { // eslint-disable-line
    if (!canApprove) { navigate('/dashboard'); return; }
    fetchLeaves();
  }, [canApprove, navigate]); // eslint-disable-line

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/v1/leave/all`, { headers: { Authorization: token } });
      setLeaves(res.data);
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    const token = getToken();
    try {
      const normalizedAction = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action;
      await axios.put(`${API_URL}/api/v1/leave/action/${id}`, { action: normalizedAction, remarks: remarks[id] || '' }, { headers: { Authorization: token } });
      toast.success(`Leave ${normalizedAction} successfully`);
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = statusFilter === 'all' ? leaves : leaves.filter(l => l.status === statusFilter);
  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  const statusStyle = (status) => {
    const map = {
      pending:  { color: 'var(--warning)', bg: 'var(--warning-soft)' },
      approved: { color: 'var(--success)', bg: 'var(--success-soft)' },
      rejected: { color: 'var(--danger)',  bg: 'var(--danger-soft)' },
    };
    return map[status] || { color: 'var(--text-muted)', bg: 'var(--bg-elevated)' };
  };

  if (loading) return <AppLayout><TableSkeleton rows={5} cols={4} /></AppLayout>;

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Leave Approvals</h1>
              {pendingCount > 0 && (
                <div style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--warning-soft)', color: 'var(--warning)', fontSize: 11, fontWeight: 700 }}>
                  {pendingCount} pending
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Review and manage team leave requests</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '7px 14px', borderRadius: 'var(--radius-full)',
              border: statusFilter === s ? 'none' : '1px solid var(--border)',
              background: statusFilter === s ? 'var(--accent)' : 'var(--bg-surface)',
              color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: statusFilter === s ? 600 : 400, cursor: 'pointer', transition: 'var(--transition)',
              textTransform: 'capitalize',
            }}>
              {s === 'all' ? `All (${leaves.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${leaves.filter(l => l.status === s).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <Users size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>No leave requests</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((leave, i) => {
              const st = statusStyle(leave.status);
              const isExpanded = expandedId === leave.id;
              return (
                <div key={leave.id} style={{
                  background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)', overflow: 'hidden',
                  animation: `fadeInUp 0.3s ease ${i * 0.04}s both`,
                  transition: 'var(--transition)',
                }}>
                  <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : leave.id)}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {leave.employee_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{leave.employee_name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: st.bg, color: st.color, textTransform: 'capitalize' }}>
                          {leave.status}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-accent)', fontWeight: 500 }}>{leave.leave_name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {formatDate(leave.from_date)} → {formatDate(leave.to_date)} · {leave.days || 0} day{(leave.days || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 22px 20px', borderTop: '1px solid var(--border)' }}>
                      {leave.reason && (
                        <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginTop: 14, marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          "{leave.reason}"
                        </div>
                      )}
                      {leave.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>Remarks (optional)</label>
                            <input
                              type="text"
                              placeholder="Add a remark..."
                              value={remarks[leave.id] || ''}
                              onChange={e => setRemarks(r => ({ ...r, [leave.id]: e.target.value }))}
                              style={{ width: '100%', height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
                            />
                          </div>
                          <button
                            onClick={() => handleAction(leave.id, 'approve')}
                            disabled={actionLoading === leave.id + 'approve'}
                            style={{ padding: '9px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--success-soft)', color: 'var(--success)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'var(--transition)', flexShrink: 0 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--success-glow)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--success-soft)'}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(leave.id, 'reject')}
                            disabled={actionLoading === leave.id + 'reject'}
                            style={{ padding: '9px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'var(--transition)', flexShrink: 0 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-glow)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                      {leave.remarks && (
                        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                          Remarks: "{leave.remarks}"
                        </div>
                      )}
                    </div>
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

export default LeaveApproval;
