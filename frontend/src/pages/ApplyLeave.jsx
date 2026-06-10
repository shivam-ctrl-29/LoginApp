import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Calendar, Info } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import { FloatingSelect, FloatingTextarea } from '../components/ui/FloatingInput';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../theme/ThemeContext';
import useAuth from '../hooks/useAuth';

function ApplyLeave() {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme } = useTheme();
  const { getToken, API_URL } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    reason: '',
  });

  useEffect(() => { // eslint-disable-line
    fetchData();
  }, []); // eslint-disable-line

  const fetchData = async () => {
    const token = getToken();
    try {
      const [typesRes, balanceRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/leave/types`),
        axios.get(`${API_URL}/api/v1/leave/balance`, { headers: { Authorization: token } }),
      ]);
      setLeaveTypes(typesRes.data);
      setBalance(balanceRes.data);
    } catch (err) {
      toast.error('Failed to load leave data');
    }
  };

  const getBalance = (typeId) => {
    const b = balance.find(bal => bal.leave_type_id === parseInt(typeId));
    return b ? b.available_days : null;
  };

  const calculateDays = () => {
    if (!form.from_date || !form.to_date) return 0;
    const from = new Date(form.from_date);
    const to = new Date(form.to_date);
    return Math.max(0, Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.leave_type_id || !form.from_date || !form.to_date || !form.reason) {
      toast.warning('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const token = getToken();
    try {
      await axios.post(`${API_URL}/api/v1/leave/apply`, form, {
        headers: { Authorization: token },
      });
      toast.success('Leave application submitted successfully!');
      setTimeout(() => navigate('/leave/my'), 800);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();
  const available = getBalance(form.leave_type_id);

  return (
    <AppLayout>
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit a new leave request for approval"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
        <GlassCard style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <FloatingSelect
              label="Leave Type"
              value={form.leave_type_id}
              onChange={e => setForm(prev => ({ ...prev, leave_type_id: e.target.value }))}
              required
            >
              <option value="">Select Leave Type</option>
              {leaveTypes.map(lt => (
                <option key={lt.id} value={lt.id}>
                  {lt.leave_name}
                </option>
              ))}
            </FloatingSelect>

            {available !== null && form.leave_type_id && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                background: `${theme.colors.info}12`,
                marginBottom: 20,
                marginTop: -8,
              }}>
                <Info size={16} color={theme.colors.info} />
                <span style={{ fontSize: 13, color: theme.colors.text }}>
                  Available balance: <strong>{available} days</strong>
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.colors.textMuted, display: 'block', marginBottom: 8 }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={form.from_date}
                  onChange={e => setForm(prev => ({ ...prev, from_date: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `1.5px solid ${theme.colors.border}`,
                    background: theme.colors.inputBg,
                    color: theme.colors.text,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: theme.colors.textMuted, display: 'block', marginBottom: 8 }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={form.to_date}
                  onChange={e => setForm(prev => ({ ...prev, to_date: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `1.5px solid ${theme.colors.border}`,
                    background: theme.colors.inputBg,
                    color: theme.colors.text,
                    fontSize: 15,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {days > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderRadius: 12,
                background: `${theme.colors.accent}10`,
                margin: '20px 0',
              }}>
                <Calendar size={18} color={theme.colors.accent} />
                <span style={{ fontSize: 14, color: theme.colors.text }}>
                  Total duration: <strong style={{ color: theme.colors.accent }}>{days} day{days !== 1 ? 's' : ''}</strong>
                </span>
              </div>
            )}

            <FloatingTextarea
              label="Reason for Leave"
              value={form.reason}
              onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
              required
            />

            <div style={{ display: 'flex', gap: 12 }}>
              <Button variant="ghost" onClick={() => navigate('/leave/my')} fullWidth>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send} disabled={loading} fullWidth>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Leave balance sidebar */}
        <GlassCard style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: theme.colors.text }}>
            Your Leave Balance
          </h3>
          {balance.length === 0 ? (
            <p style={{ fontSize: 14, color: theme.colors.textMuted }}>No balance data available</p>
          ) : (
            balance.map(b => (
              <div
                key={b.leave_type_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <span style={{ fontSize: 14, color: theme.colors.textSecondary }}>{b.leave_name}</span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: b.available_days > 0 ? theme.colors.success : theme.colors.danger,
                }}>
                  {b.available_days}
                  <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textMuted, marginLeft: 4 }}>days</span>
                </span>
              </div>
            ))
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
}

export default ApplyLeave;
