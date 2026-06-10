import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, X, MessageSquare, Filter } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import Badge, { statusVariant } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import useAuth from '../hooks/useAuth';

function LeaveApproval() {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
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

  if (loading) {
    return (
      <AppLayout>
        <PageHeader title="Leave Approvals" subtitle="Review and manage leave requests" />
        <TableSkeleton rows={4} cols={4} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Leave Approvals"
        subtitle={`${pendingCount} pending request${pendingCount !== 1 ? 's' : ''} awaiting review`}
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '8px 18px',
              borderRadius: 20,
              border: `1.5px solid ${statusFilter === status ? theme.colors.accent : theme.colors.border}`,
              background: statusFilter === status ? `${theme.colors.accent}15` : 'transparent',
              color: statusFilter === status ? theme.colors.accent : theme.colors.textSecondary,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {status === 'all' ? 'All Requests' : status}
            {status === 'pending' && pendingCount > 0 && (
              <span style={{
                marginLeft: 6,
                background: theme.colors.accent,
                color: '#fff',
                borderRadius: 10,
                padding: '1px 7px',
                fontSize: 11,
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <GlassCard style={{ padding: 60, textAlign: 'center' }}>
          <Filter size={32} color={theme.colors.textMuted} style={{ marginBottom: 16 }} />
          <p style={{ color: theme.colors.textSecondary, fontSize: 14 }}>No leave requests match this filter</p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(leave => (
            <GlassCard key={leave.id} style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar name={leave.employee_name} size={48} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.colors.text }}>
                      {leave.employee_name}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: theme.colors.textMuted }}>
                      {leave.email}
                    </p>
                  </div>
                </div>
                <Badge variant={statusVariant(leave.status)}>{leave.status}</Badge>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 16,
                padding: 16,
                borderRadius: 12,
                background: `${theme.colors.blue}06`,
                marginBottom: leave.status === 'pending' ? 20 : 0,
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.colors.textMuted, marginBottom: 4 }}>Leave Type</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>{leave.leave_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.colors.textMuted, marginBottom: 4 }}>Duration</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.text }}>
                    {formatDate(leave.from_date)} — {formatDate(leave.to_date)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.colors.textMuted, marginBottom: 4 }}>Total Days</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: theme.colors.accent }}>{leave.total_days} days</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.colors.textMuted, marginBottom: 4 }}>Reason</div>
                  <div style={{ fontSize: 14, color: theme.colors.textSecondary, lineHeight: 1.5 }}>{leave.reason}</div>
                </div>
              </div>

              {leave.status === 'pending' && (
                <div>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <MessageSquare size={16} style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: theme.colors.textMuted,
                    }} />
                    <input
                      placeholder="Add remarks (optional)"
                      value={remarks[leave.id] || ''}
                      onChange={e => setRemarks(prev => ({ ...prev, [leave.id]: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: 10,
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.colors.inputBg,
                        color: theme.colors.text,
                        fontSize: 14,
                        fontFamily: 'inherit',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button
                      variant="success"
                      icon={Check}
                      fullWidth
                      disabled={actionLoading === leave.id}
                      onClick={() => handleAction(leave.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      icon={X}
                      fullWidth
                      disabled={actionLoading === leave.id}
                      onClick={() => handleAction(leave.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default LeaveApproval;
