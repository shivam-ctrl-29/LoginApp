/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogIn, LogOut, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';

function Attendance() {
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };
  const [todayStatus, setTodayStatus] = useState(null);
  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0, records: [] });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [month, year]); // eslint-disable-line

  const fetchData = async () => {
    try {
      const [todayRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/api/v1/attendance/today`, { headers }),
        axios.get(`${API_URL}/api/v1/attendance/my?month=${month}&year=${year}`, { headers }),
      ]);
      setTodayStatus(todayRes.data.attendance);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading('checkin');
    try {
      await axios.post(`${API_URL}/api/v1/attendance/checkin`, {}, { headers });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleCheckOut = async () => {
    setActionLoading('checkout');
    try {
      await axios.post(`${API_URL}/api/v1/attendance/checkout`, {}, { headers });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading('');
    }
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const attendanceRate = summary.total > 0
    ? Math.round(((summary.present + summary.late) / summary.total) * 100)
    : 0;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const checkedIn = todayStatus?.checkIn && !todayStatus?.checkOut;
  const checkedOut = todayStatus?.checkIn && todayStatus?.checkOut;

  const attended = (summary.present || 0) + (summary.late || 0);
  const pieData = [
    { name: 'Attended', value: attended, color: '#10b981' },
    { name: 'Absent', value: summary.absent || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = [
    { label: 'Present', value: summary.present || 0, color: '#10b981' },
    { label: 'Late', value: summary.late || 0, color: '#f59e0b' },
    { label: 'Absent', value: summary.absent || 0, color: '#ef4444' },
  ];

  const statCards = [
    { label: 'Days Attended', value: attended, color: 'var(--success)', icon: CheckCircle },
    { label: 'Late Days', value: summary.late || 0, color: 'var(--warning)', icon: AlertTriangle },
    { label: 'Absent Days', value: summary.absent || 0, color: 'var(--danger)', icon: XCircle },
    { label: 'Attendance Rate', value: attendanceRate + '%', color: 'var(--accent)', icon: TrendingUp },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{payload[0].payload.date}</div>
          <div style={{ fontSize: 11, color: payload[0].payload.status === 'present' ? '#10b981' : payload[0].payload.status === 'late' ? '#f59e0b' : '#ef4444' }}>
            {payload[0].payload.status === 'present' ? 'Present' : payload[0].payload.status === 'late' ? 'Late' : 'Absent'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Attendance</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Check-in hero card */}
        <div style={{
          background: checkedOut ? 'linear-gradient(135deg, #059669, #10b981)' : checkedIn ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 20,
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
        }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -60, right: -40, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -40, right: 100, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
                {checkedOut ? 'Work Day Complete' : checkedIn ? 'Currently Working' : 'Not Checked In'}
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>{timeStr}</div>
              <div style={{ display: 'flex', gap: 20 }}>
                {todayStatus?.checkIn && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                    In: <strong style={{ color: '#fff' }}>{new Date(todayStatus.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                )}
                {todayStatus?.checkOut && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                    Out: <strong style={{ color: '#fff' }}>{new Date(todayStatus.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {!checkedIn && !checkedOut && (
                <button
                  onClick={handleCheckIn}
                  disabled={Boolean(actionLoading)}
                  style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: '#fff', color: '#6366f1', fontSize: 14, fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'var(--transition)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  {actionLoading === 'checkin' ? <span style={{ width: 14, height: 14, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} /> : <LogIn size={16} />}
                  Check In
                </button>
              )}
              {checkedIn && (
                <button
                  onClick={handleCheckOut}
                  disabled={Boolean(actionLoading)}
                  style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'var(--transition)', backdropFilter: 'blur(10px)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  {actionLoading === 'checkout' ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} /> : <LogOut size={16} />}
                  Check Out
                </button>
              )}
              {checkedOut && (
                <div style={{ padding: '12px 22px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={16} /> Day Complete
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', border: '1px solid var(--border)', transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Icon size={16} color={card.color} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Month selector + charts */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ height: 36, padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ height: 36, padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 20 }}>
          <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Attendance Summary — {months[month - 1]} {year}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Total days by status this month</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={52} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}
                  formatter={(value, name) => [value + ' days', name]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Status Breakdown</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Late counts as attended</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData.length ? pieData : [{ name: 'No data', value: 1, color: 'var(--border)' }]} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={pieData.length > 1 ? 4 : 0} dataKey="value">
                  {(pieData.length ? pieData : [{ color: 'var(--border)' }]).map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />Attended (Present + Late)</div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{attended}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 12 }}>
                  <span>· On time: {summary.present || 0}</span>
                  <span>· Late: {summary.late || 0}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} />Absent</div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{summary.absent || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Records table */}
        {summary.records && summary.records.length > 0 && (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Attendance Records</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {['Date', 'Check In', 'Check Out', 'Status'].map((h, i) => (
                    <th key={i} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summary.records.slice(-10).reverse().map((rec, i) => {
                  const statusColors = { present: 'var(--success)', late: 'var(--warning)', absent: 'var(--danger)' };
                  const statusBgs = { present: 'var(--success-soft)', late: 'var(--warning-soft)', absent: 'var(--danger-soft)' };
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', height: 52, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '0 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: statusBgs[rec.status] || 'var(--bg-elevated)', color: statusColors[rec.status] || 'var(--text-muted)', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Attendance;
