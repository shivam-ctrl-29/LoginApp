import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../redux/slices/authSlice';
import axios from 'axios';
import {
  Users, Building2, Target, Image, Clock, CheckCircle,
  XCircle, FileText, Mail,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import GlassCard from '../components/ui/GlassCard';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user, loading } = useSelector(state => state.auth);
  const [stats, setStats] = useState({});
  const [leaveStats, setLeaveStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const [empStats, lvStats] = await Promise.all([
          axios.get(`${API_URL}/api/v1/employees/stats/dashboard`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/v1/leave/stats`, {
            headers: { Authorization: token },
          }),
        ]);
        setStats(empStats.data);
        setLeaveStats(lvStats.data);
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

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
      <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        Company Overview
      </h3>
      {statsLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 130, borderRadius: 16, background: theme.colors.glass }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees || 0}
            icon={Users}
            color={theme.colors.blue}
            onClick={() => navigate('/employees')}
          />
          <StatCard
            title="Departments"
            value={stats.totalDepartments || 0}
            icon={Building2}
            color={theme.colors.chart3}
          />
          <StatCard
            title="Skills Tracked"
            value={stats.totalSkills || 0}
            icon={Target}
            color={theme.colors.chart4}
          />
          <StatCard
            title="Profile Images"
            value={stats.totalImages || 0}
            icon={Image}
            color={theme.colors.accent}
          />
        </div>
      )}

      {/* Leave stats */}
      <h3 style={{ fontSize: 13, fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        Leave Analytics
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard title="Pending" value={leaveStats.pending || 0} icon={Clock} color={theme.colors.warning} />
        <StatCard title="Approved" value={leaveStats.approved || 0} icon={CheckCircle} color={theme.colors.success} />
        <StatCard title="Rejected" value={leaveStats.rejected || 0} icon={XCircle} color={theme.colors.danger} />
        <StatCard title="Total Requests" value={leaveStats.total || 0} icon={FileText} color={theme.colors.info} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <ChartCard
          title="Workforce Distribution"
          subtitle="Key organizational metrics"
          type="bar"
          data={[
            { label: 'Employees', value: stats.totalEmployees || 0 },
            { label: 'Depts', value: stats.totalDepartments || 0 },
            { label: 'Skills', value: stats.totalSkills || 0 },
            { label: 'Images', value: stats.totalImages || 0 },
          ]}
        />
        <ChartCard
          title="Leave Status Breakdown"
          subtitle="Current leave request distribution"
          type="donut"
          segments={[
            { label: 'Pending', value: leaveStats.pending || 0, color: theme.colors.warning },
            { label: 'Approved', value: leaveStats.approved || 0, color: theme.colors.success },
            { label: 'Rejected', value: leaveStats.rejected || 0, color: theme.colors.danger },
          ]}
        />
      </div>
    </AppLayout>
  );
}

export default Dashboard;
