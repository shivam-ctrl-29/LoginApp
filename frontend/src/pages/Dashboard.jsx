import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../redux/slices/authSlice';
import axios from 'axios';
import {
  Users, Clock, Package, AlertCircle, TrendingUp, TrendingDown,
  Plus, FileText, Calendar, Settings, ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import API_URL from '../config/api';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const [stats, setStats] = useState({});
  const [deptData, setDeptData] = useState([]);
  const [assetStats, setAssetStats] = useState({ total: 0, allocated: 0, available: 0 });
  const [leaveStats, setLeaveStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const [empStats, lvStats, deptStats, assetRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/employees/stats/dashboard`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/v1/leave/stats`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/v1/employees/stats/by-department`, {
            headers: { Authorization: token },
          }),
          axios.get(`${API_URL}/api/v1/assets?limit=1000`, {
            headers: { Authorization: token },
          }),
        ]);
        setStats(empStats.data);
        setLeaveStats(lvStats.data);
        setDeptData(deptStats.data.map(d => ({ name: d.department, value: d.employees })));
        const assets = assetRes.data?.assets || [];
        setAssetStats({
          total: assets.length,
          allocated: assets.filter(a => a.status === 'allocated').length,
          available: assets.filter(a => a.status === 'available').length,
        });
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



  const pieData = [
    { name: 'Pending', value: leaveStats.pending || 0, color: '#f59e0b' },
    { name: 'Approved', value: leaveStats.approved || 0, color: '#22c55e' },
    { name: 'Rejected', value: leaveStats.rejected || 0, color: '#ef4444' },
  ];

  const activities = [
    { type: 'hire', message: 'New employee joined Engineering', time: '2 hours ago', color: '#22c55e' },
    { type: 'leave', message: 'Leave request approved for John Doe', time: '4 hours ago', color: '#6366f1' },
    { type: 'asset', message: 'Laptop assigned to Sarah Smith', time: '6 hours ago', color: '#8b5cf6' },
    { type: 'alert', message: 'Pending approval: 3 leave requests', time: '8 hours ago', color: '#f59e0b' },
  ];

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            {getGreeting()}, {user.name?.split(' ')[0]}
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
          }}>
            {getCurrentDate()}
          </p>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {/* Total Employees */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => navigate('/employees')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={24} color="#fff" />
              </div>
              
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {stats.totalEmployees || 0}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Employees
            </div>
          </div>

          {/* On Leave Today */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={24} color="#fff" />
              </div>
              
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {leaveStats.approved || 0}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              On Leave Today
            </div>
          </div>

          {/* Assets Allocated */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => navigate('/assets')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Package size={24} color="#fff" />
              </div>
              
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {assetStats.allocated}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Assets Allocated
            </div>
          </div>

          {/* Pending Approvals */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          onClick={() => navigate('/leave/approval')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircle size={24} color="#fff" />
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: 20,
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}>
                URGENT
              </div>
              
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {leaveStats.pending || 0}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Approvals
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 32 }}>
          {/* Bar Chart */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              Employees by Department
            </h3>
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 24,
            }}>
              Workforce distribution across teams
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    background: '#16161f',
                    border: '1px solid #1e1e2e',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                />
                <Bar dataKey="value" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              Leave Status
            </h3>
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 24,
            }}>
              Current leave breakdown
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: '#16161f',
                    border: '1px solid #1e1e2e',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16 }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 3fr', gap: 20 }}>
          {/* Recent Activity */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activities.map((activity, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: activity.color,
                    marginTop: 6,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {activity.message}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 20,
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => navigate('/employees/create')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--gradient)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
              >
                <span>Add Employee</span>
                <Plus size={16} />
              </button>
              <button
                onClick={() => navigate('/leave/apply')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >
                <span>Apply Leave</span>
                <Calendar size={16} />
              </button>
              <button
                onClick={() => navigate('/reports')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >
                <span>View Reports</span>
                <FileText size={16} />
              </button>
              <button
                onClick={() => navigate('/admin')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >
                <span>Settings</span>
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
