/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../redux/slices/authSlice';
import axios from 'axios';
import {
  Users, Clock, Package, AlertCircle,
  Plus, FileText, Calendar, Settings, ArrowRight, TrendingUp,
  Activity,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import API_URL from '../config/api';

const MetricCard = ({ icon: Icon, label, value, color, gradient, onClick, badge }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--gradient-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        border: hovered ? '1px solid var(--border-hover)' : '1px solid var(--border)',
        borderTop: `3px solid ${color}`,
        transition: 'var(--transition)',
        cursor: onClick ? 'pointer' : 'default',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `${color}08`, borderRadius: '0 0 0 100%', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color}30` }}>
          <Icon size={20} color="#fff" strokeWidth={2} />
        </div>
        {badge && (
          <div style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
            {badge}
          </div>
        )}
      </div>
      <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 5, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const [stats, setStats] = useState({});
  const [deptData, setDeptData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [assetStats, setAssetStats] = useState({ total: 0, allocated: 0, available: 0 });
  const [leaveStats, setLeaveStats] = useState({});

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const [empStats, lvStats, deptStats, assetRes, auditRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/employees/stats/dashboard`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/v1/leave/stats`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/v1/employees/stats/by-department`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/v1/assets?limit=1000`, { headers: { Authorization: token } }),
          axios.get(`${API_URL}/api/v1/audit?limit=5`, { headers: { Authorization: token } }),
        ]);
        setStats(empStats.data);
        setLeaveStats(lvStats.data);
        setDeptData(deptStats.data.filter(d => d.employees > 0).map(d => ({ name: d.department, value: d.employees })));
        const assets = assetRes.data?.assets || [];
        setAssetStats({
          total: assets.length,
          allocated: assets.filter(a => a.status === 'allocated').length,
          available: assets.filter(a => a.status === 'available').length,
        });
        const logs = auditRes.data?.logs || auditRes.data?.data || [];
        setActivities(logs.map(log => ({
          message: `${log.actionType} on ${log.tableName} by ${log.user?.name || 'System'}`,
          time: new Date(log.createdAt).toLocaleTimeString(),
          color: log.actionType === 'CREATE' ? 'var(--success)' : log.actionType === 'DELETE' ? 'var(--danger)' : 'var(--accent)',
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (loading || !user) {
    return <AppLayout><DashboardSkeleton /></AppLayout>;
  }

  const pieData = [
    { name: 'Pending', value: leaveStats.pending || 0, color: '#f59e0b' },
    { name: 'Approved', value: leaveStats.approved || 0, color: '#10b981' },
    { name: 'Rejected', value: leaveStats.rejected || 0, color: '#ef4444' },
  ];
  const totalLeaves = pieData.reduce((a, b) => a + b.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', boxShadow: 'var(--shadow-md)', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{payload[0].payload.name}</div>
          <div style={{ fontSize: 12, color: 'var(--accent)' }}>{payload[0].value} employees</div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{payload[0].name}: {payload[0].value}</div>
        </div>
      );
    }
    return null;
  };

  const quickActions = [
    { label: 'Add Employee', icon: Plus, onClick: () => navigate('/employees/create'), primary: true },
    { label: 'Apply Leave', icon: Calendar, onClick: () => navigate('/leave/apply') },
    { label: 'View Reports', icon: FileText, onClick: () => navigate('/reports') },
    { label: 'Admin Panel', icon: Settings, onClick: () => navigate('/admin') },
  ];

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {getGreeting()}, {user.name?.split(' ')[0]}
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {getCurrentDate()} · Your workspace is ready
          </p>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <MetricCard
            icon={Users} label="Total Employees" value={stats.totalEmployees || 0}
            color="#6366f1" gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            onClick={() => navigate('/employees')}
          />
          <MetricCard
            icon={Clock} label="Pending Leaves" value={leaveStats.pending || 0}
            color="#f59e0b" gradient="linear-gradient(135deg, #f59e0b, #f97316)"
            onClick={() => navigate('/leave/approval')}
            badge={leaveStats.pending > 0 ? 'REVIEW' : null}
          />
          <MetricCard
            icon={Package} label="Assets Allocated" value={assetStats.allocated}
            color="#8b5cf6" gradient="linear-gradient(135deg, #8b5cf6, #a855f7)"
            onClick={() => navigate('/assets')}
          />
          <MetricCard
            icon={TrendingUp} label="On Leave Today" value={leaveStats.approved || 0}
            color="#3b82f6" gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
          />
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, marginBottom: 24 }}>
          {/* Bar Chart */}
          <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Employees by Department</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Workforce distribution across teams</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData} barSize={28}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart */}
          <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', border: '1px solid var(--border)' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>Leave Status</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Current leave breakdown</p>
            </div>
            <div style={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalLeaves}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>TOTAL</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
              {pieData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name} · {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity + Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '65fr 35fr', gap: 16 }}>
          {/* Activity Feed */}
          <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Recent Activity</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Latest system events</p>
              </div>
              <Activity size={16} color="var(--text-muted)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {activities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>No recent activity</div>
              )}
              {activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: 14, marginBottom: 14, borderBottom: i < activities.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginTop: 5, flexShrink: 0, boxShadow: `0 0 6px ${a.color}` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>{a.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '22px 24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Quick Actions</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>Common tasks at your fingertips</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={action.onClick}
                    style={{
                      width: '100%', padding: '11px 14px',
                      borderRadius: 'var(--radius-md)', border: action.primary ? 'none' : '1px solid var(--border)',
                      background: action.primary ? 'var(--gradient)' : 'var(--bg-elevated)',
                      color: action.primary ? '#fff' : 'var(--text-primary)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'var(--transition)',
                      boxShadow: action.primary ? 'var(--shadow-accent)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (action.primary) e.currentTarget.style.filter = 'brightness(1.1)';
                      else e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.filter = '';
                      e.currentTarget.style.background = action.primary ? '' : 'var(--bg-elevated)';
                      e.currentTarget.style.transform = '';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={15} />
                      {action.label}
                    </div>
                    <ArrowRight size={14} opacity={0.6} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
