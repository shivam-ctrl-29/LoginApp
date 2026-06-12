/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Calendar, Info, Clock, CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../context/ToastContext';
import useAuth from '../hooks/useAuth';

const LEAVE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444'];

function ApplyLeave() {
  const navigate = useNavigate();
  const toast = useToast();
  const { getToken, API_URL } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [form, setForm] = useState({ leave_type_id: '', from_date: '', to_date: '', reason: '' });

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

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
      await axios.post(`${API_URL}/api/v1/leave/apply`, form, { headers: { Authorization: token } });
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

  const inputStyle = (key) => ({
    width: '100%', height: 44, padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: focusedField === key ? '1px solid var(--accent)' : '1px solid var(--border)',
    background: 'var(--bg-elevated)', color: 'var(--text-primary)',
    fontSize: 14, outline: 'none', transition: 'var(--transition)',
    boxShadow: focusedField === key ? '0 0 0 3px var(--accent-glow)' : 'none',
  });

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Apply for Leave</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Submit a leave application for manager approval</p>
        </div>

        {/* Leave balance */}
        {balance.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {balance.slice(0, 4).map((b, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 16px', flex: '1 1 120px' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: LEAVE_COLORS[i % LEAVE_COLORS.length], lineHeight: 1 }}>{b.available_days}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{b.leave_name || 'Leave'}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Leave Type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                {leaveTypes.map((lt, i) => {
                  const selected = form.leave_type_id === String(lt.id);
                  const color = LEAVE_COLORS[i % LEAVE_COLORS.length];
                  const bal = getBalance(lt.id);
                  return (
                    <button
                      key={lt.id} type="button"
                      onClick={() => setForm(f => ({ ...f, leave_type_id: String(lt.id) }))}
                      style={{
                        padding: '12px', borderRadius: 'var(--radius-md)',
                        border: selected ? `2px solid ${color}` : '1px solid var(--border)',
                        background: selected ? `${color}12` : 'var(--bg-elevated)',
                        cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: selected ? color : 'var(--text-primary)', marginBottom: 3 }}>{lt.leave_name || lt.name}</div>
                      {bal !== null && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bal} days left</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>From Date *</label>
                <input type="date" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))}
                  onFocus={() => setFocusedField('from')} onBlur={() => setFocusedField('')}
                  style={inputStyle('from')} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>To Date *</label>
                <input type="date" value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                  onFocus={() => setFocusedField('to')} onBlur={() => setFocusedField('')}
                  style={inputStyle('to')} required />
              </div>
            </div>

            {days > 0 && (
              <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={15} color="var(--accent)" />
                <span style={{ fontSize: 13, color: 'var(--text-accent)', fontWeight: 600 }}>
                  {days} day{days !== 1 ? 's' : ''} requested
                  {available !== null && ` · ${available} days available`}
                </span>
                {available !== null && days > available && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>⚠ Insufficient balance</span>
                )}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Reason *</label>
              <textarea
                value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Please provide a reason for your leave request..."
                rows={4} required
                onFocus={() => setFocusedField('reason')} onBlur={() => setFocusedField('')}
                style={{ ...inputStyle('reason'), height: 'auto', padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => navigate('/leave/my')} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              >Cancel</button>
              <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: loading ? 'none' : 'var(--shadow-accent)', transition: 'var(--transition)' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                    Submitting...
                  </span>
                ) : <><Send size={14} /> Submit Application</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default ApplyLeave;
