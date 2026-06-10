import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Calendar, Info, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../context/ToastContext';
import useAuth from '../hooks/useAuth';

function ApplyLeave() {
  const navigate = useNavigate();
  const toast = useToast();
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
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              Apply for Leave
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Submit a new leave request for approval
            </p>
          </div>

          {/* Form Card */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
            border: '1px solid var(--border)',
          }}>
            <form onSubmit={handleSubmit}>
              {/* Leave Type */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}>
                  Leave Type *
                </label>
                <select
                  value={form.leave_type_id}
                  onChange={e => setForm(prev => ({ ...prev, leave_type_id: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.leave_name}
                    </option>
                  ))}
                </select>

                {available !== null && form.leave_type_id && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--accent-soft)',
                    marginTop: 8,
                  }}>
                    <Info size={14} color="var(--accent)" />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Available balance: <strong style={{ color: 'var(--accent)' }}>{available} days</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Date Range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                  }}>
                    From Date *
                  </label>
                  <input
                    type="date"
                    value={form.from_date}
                    onChange={e => setForm(prev => ({ ...prev, from_date: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                  }}>
                    To Date *
                  </label>
                  <input
                    type="date"
                    value={form.to_date}
                    onChange={e => setForm(prev => ({ ...prev, to_date: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              {/* Duration Info */}
              {days > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-soft)',
                  marginBottom: 24,
                }}>
                  <Calendar size={16} color="var(--accent)" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Total duration: <strong style={{ color: 'var(--accent)' }}>{days} day{days !== 1 ? 's' : ''}</strong>
                  </span>
                </div>
              )}

              {/* Reason */}
              <div style={{ marginBottom: 24 }}>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}>
                  Reason for Leave *
                </label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide a reason for your leave request..."
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate('/leave/my')}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'var(--gradient)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => !loading && (e.target.style.filter = 'brightness(1.1)')}
                  onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
                >
                  <Send size={16} />
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>

          {/* Leave Balance Card */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
            marginTop: 20,
          }}>
            <h3 style={{
              margin: '0 0 20px',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}>
              Your Leave Balance
            </h3>
            {balance.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No balance data available</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {balance.map(b => (
                  <div
                    key={b.leave_type_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{b.leave_name}</span>
                    <span style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: b.available_days > 0 ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {b.available_days}
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>days</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ApplyLeave;
