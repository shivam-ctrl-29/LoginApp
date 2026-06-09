import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../redux/slices/authSlice';
import axios from 'axios';
import {
  Users, Building2, Target, Image, Clock, CheckCircle,
  XCircle, FileText, Mail, Package,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  LineChart, Line,
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

function ChartContainer({ title, subtitle, children, style }) {
  const { theme } = useTheme();
  return (
    <GlassCard style={{ padding: 24, ...style }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </GlassCard>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user, loading } = useSelector(state => state.auth);

  const [stats, setStats] = useState({});
  const [leaveStats, setLeaveStats] = useState({});
  const [deptData, setDeptData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [leaveTypeData, setLeaveTypeData] = useState([]);
  const [assetStats, setAssetStats] = useState({ total: 0, allocated: 0, available: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: token };
      try {
        const [empStats, lvStats, deptStats, monthly, leaveTypes, assets] = await Promise.all([
          axios.get(`${API_URL}/api/employees/stats/dashboard`, { headers }),
          axios.get(`${API_URL}/api/leave/stats`, { headers }),
          axios.get(`${API_URL}/api/employees/stats/by-department`, { headers }),
          axios.get(`${API_URL}/api/employees/stats/monthly-joining`, { headers }),
          axios.get(`${API_URL}/api/leave/stats/by-type`, { headers }),
          axios.get(`${API_URL}/api/assets`, { headers }).catch(() => ({ data: [] })),
        ]);
        setStats(empStats.data);
        setLeaveStats(lvStats.data);
        setDeptData(deptStats.data);
        setMonthlyData(monthly.data);
        setLeaveTypeData(leaveTypes.data.filter(d => d.value > 0));

        // Compute asset stats from asset list
        const allAssets = Array.isArray(assets.data) ? assets.data : (assets.data?.assets || []);
        setAssetStats({
          total: allAssets.length,
          allocated: allAssets.filter(a => a.status === 'allocated').length,
          available: allAssets.filter(a => a.status === 'available').length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !user) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  const roleVariant = user?.role === 'admin' ? 'admin' : 'success';

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${user.name?.split(' ')[0]}`}
        subtitle="Here's what's happening across your organization today"
      />

      {/* Profile banner */}
      <GlassCard style={{ padding: 24, marginBottom: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}>
        <Avatar name={user.name} size={64} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, color: theme.colors.text }}>
            {user.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: theme.colors.textSecondary }}>
              <Mail size={14} /> {user.email}
            </span>
            <Badge variant={roleVariant}>{user.role}</Badge>
          </div>
        </div>
      </GlassCard>

      {/* Company stats */}
      <SectionLabel label="Company Overview" theme={theme} />
      {statsLoading ? (
        <SkeletonGrid theme={theme} count={4} />
      ) : (
        <div style={gridStyle}>
          <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={Users} color={theme.colors.blue} onClick={() => navigate('/employees')} />
          <StatCard title="Departments" value={stats.totalDepartments || 0} icon={Building2} color={theme.colors.chart3} />
          <StatCard title="Skills Tracked" value={stats.totalSkills || 0} icon={Target} color={theme.colors.chart4} />
          <StatCard title="Profile Images" value={stats.totalImages || 0} icon={Image} color={theme.colors.accent} />
        </div>
      )}

      {/* Asset stats */}
      <SectionLabel label="Asset Overview" theme={theme} />
      <div style={gridStyle}>
        <StatCard title="Total Assets" value={assetStats.total} icon={Package} color={theme.colors.info} onClick={() => navigate('/assets')} />
        <StatCard title="Allocated" value={assetStats.allocated} icon={CheckCircle} color={theme.colors.warning} />
        <StatCard title="Available" value={assetStats.available} icon={FileText} color={theme.colors.success} />
      </div>

      {/* Leave stats */}
      <SectionLabel label="Leave Analytics" theme={theme} />
      <div style={{ ...gridStyle, marginBottom: 32 }}>
        <StatCard title="Pending" value={leaveStats.pending || 0} icon={Clock} color={theme.colors.warning} />
        <StatCard title="Approved" value={leaveStats.approved || 0} icon={CheckCircle} color={theme.colors.success} />
        <StatCard title="Rejected" value={leaveStats.rejected || 0} icon={XCircle} color={theme.colors.danger} />
        <StatCard title="Total Requests" value={leaveStats.total || 0} icon={FileText} color={theme.colors.info} />
      </div>

      {/* ── CHARTS ── */}
      <SectionLabel label="Charts & Analytics" theme={theme} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 20 }}>

        {/* Bar Chart — Department-wise employees */}
        <ChartContainer title="Employees by Department" subtitle="Headcount per department">
          {deptData.length === 0 ? (
            <EmptyChart theme={theme} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: theme.colors.textSecondary }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: theme.colors.textSecondary }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 8, color: theme.colors.text }} />
                <Bar dataKey="employees" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Pie Chart — Leave type breakdown */}
        <ChartContainer title="Leave by Type" subtitle="Distribution across leave categories">
          {leaveTypeData.length === 0 ? (
            <EmptyChart theme={theme} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={leaveTypeData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {leaveTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 8, color: theme.colors.text }} />
                <Legend wrapperStyle={{ fontSize: 12, color: theme.colors.textSecondary }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Area Chart — Monthly joining trend */}
        <ChartContainer title="Monthly Joining Trend" subtitle="New employees per month">
          {monthlyData.length === 0 ? (
            <EmptyChart theme={theme} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                <defs>
                  <linearGradient id="joinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme.colors.textSecondary }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: theme.colors.textSecondary }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 8, color: theme.colors.text }} />
                <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fill="url(#joinGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartContainer>

        {/* Line Chart — Leave status trend */}
        <ChartContainer title="Leave Status Overview" subtitle="Pending vs Approved vs Rejected">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={[
                { status: 'Pending', count: leaveStats.pending || 0 },
                { status: 'Approved', count: leaveStats.approved || 0 },
                { status: 'Rejected', count: leaveStats.rejected || 0 },
                { status: 'Total', count: leaveStats.total || 0 },
              ]}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: theme.colors.textSecondary }} />
              <YAxis tick={{ fontSize: 11, fill: theme.colors.textSecondary }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, borderRadius: 8, color: theme.colors.text }} />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 5, fill: '#f59e0b' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

      </div>
    </AppLayout>
  );
}

// ── Helpers ──────────────────────────────────────────────

function SectionLabel({ label, theme }) {
  return (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, marginTop: 8 }}>
      {label}
    </h3>
  );
}

function SkeletonGrid({ theme, count }) {
  return (
    <div style={{ ...gridStyle, marginBottom: 32 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: 130, borderRadius: 16, background: theme.colors.glass }} />
      ))}
    </div>
  );
}

function EmptyChart({ theme }) {
  return (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.textMuted, fontSize: 13 }}>
      No data available yet
    </div>
  );
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 20,
  marginBottom: 24,
};

export default Dashboard;
