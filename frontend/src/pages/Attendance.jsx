/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LogIn, LogOut, Clock, CheckCircle, XCircle, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
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

  const getStatusColor = (status) => {
    if (status === 'present') return 'var(--success)';
    if (status === 'late') return 'var(--warning)';
    if (status === 'absent') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  const getStatusBg = (status) => {
    if (status === 'present') return 'var(--success-soft)';
    if (status === 'late') return 'var(--warning-soft)';
    if (status === 'absent') return 'var(--danger-soft)';
    return 'var(--bg-elevated)';
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const attendanceRate = summary.total > 0 
    ? Math.round(((summary.present + summary.late) / summary.total) * 100) 
    : 0;

  return (
    <AppLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Attendance
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Check In/Out Card */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontWeight: 500 }}>
              TODAY'S STATUS
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {!todayStatus || todayStatus.status === 'not_checked_in' ? 'Not Checked In' :
               todayStatus.status === 'present' ? '✓ Present' :
               todayStatus.status === 'late' ? '⚠ Late' : 'Absent'}
            </div>
            {todayStatus?.checkIn && (
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                Check-in: {new Date(todayStatus.checkIn).toLocaleTimeString()}
                {todayStatus?.checkOut && ` • Check-out: ${new Date(todayStatus.checkOut).toLocaleTimeString()}`}
                {todayStatus?.workHours && ` • ${todayStatus.workHours}hrs worked`}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {(!todayStatus || !todayStatus.checkIn) && (
              <button
                onClick={handleCheckIn}
                disabled={actionLoading === 'checkin'}
                style={{
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: '#fff',
                  color: '#6366f1',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <LogIn size={20} />
                {actionLoading === 'checkin' ? 'Checking in...' : 'Check In'}
              </button>
            )}
            {todayStatus?.checkIn && !todayStatus?.checkOut && (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading === 'checkout'}
                style={{
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  background: 'transparent',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={20} />
                {actionLoading === 'checkout' ? 'Checking out...' : 'Check Out'}
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Present', value: summary.present + summary.late, icon: CheckCircle, color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'Late', value: summary.late, icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-soft)' },
            { label: 'Absent', value: summary.absent, icon: XCircle, color: 'var(--danger)', bg: 'var(--danger-soft)' },
            { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: TrendingUp, color: 'var(--accent)', bg: 'var(--accent-soft)' },
          ].map((card, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 20,
              border: '1px solid var(--border)',
              transition: 'all 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={20} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Graphs Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Bar Chart - Daily Attendance */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Daily Attendance</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Check-in times this month</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { status: 'Present', count: summary.present + summary.late, fill: '#22c55e' },
                { status: 'Late', count: summary.late, fill: '#f59e0b' },
                { status: 'Absent', count: summary.absent, fill: '#ef4444' },
              ]}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} formatter={(value) => [value, 'Days']} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80}>
                  {[
                    { fill: '#22c55e' },
                    { fill: '#f59e0b' },
                    { fill: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12 }}>
              {[{ color: '#22c55e', label: 'Present' }, { color: '#f59e0b', label: 'Late' }, { color: '#ef4444', label: 'Absent' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart - Attendance Summary */}
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Attendance Breakdown</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Monthly summary for {months[month - 1]} {year}</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Present', value: summary.present + summary.late, color: '#22c55e' },
                    { name: 'Absent', value: summary.absent, color: '#ef4444' },
                  ].filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {[
                    { name: 'Present', value: summary.present + summary.late, color: '#22c55e' },
                    { name: 'Absent', value: summary.absent, color: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
              {[
                { color: '#22c55e', label: 'Present', value: summary.present + summary.late },
                { color: '#ef4444', label: 'Absent', value: summary.absent },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}: <strong style={{ color: 'var(--text-primary)' }}>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Month Filter + Records */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Attendance Records</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Date', 'Day', 'Check In', 'Check Out', 'Work Hours', 'Status'].map((h, i) => (
                  <th key={i} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.records.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    No attendance records for this month
                  </td>
                </tr>
              ) : (
                summary.records.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-primary)' }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-primary)' }}>
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-primary)' }}>
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-primary)' }}>
                      {record.workHours ? `${record.workHours}hrs` : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 20, background: getStatusBg(record.status), color: getStatusColor(record.status), fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default Attendance;
