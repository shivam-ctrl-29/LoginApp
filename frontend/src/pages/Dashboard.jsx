import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, logout } from '../redux/slices/authSlice';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (error) navigate('/');
  }, [error, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/employees/stats/dashboard`, {
          headers: { Authorization: token }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
    } catch (err) {
      console.log('Logout error:', err);
    }
    dispatch(logout());
    navigate('/');
  };

  if (loading || !user) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <h2 style={styles.welcome}>Welcome, {user?.name}! 👋</h2>

        <div style={styles.infoBox}>
          <div style={styles.infoRow}>
            <span style={styles.label}>📧 Email</span>
            <span style={styles.value}>{user?.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>👤 Role</span>
            <span style={{
              ...styles.value,
              color: user?.role === 'admin' ? '#2196F3' : '#4CAF50'
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard} onClick={() => navigate('/employees')}>
            <h3 style={styles.statNumber}>{stats.totalEmployees || 0}</h3>
            <p style={styles.statLabel}>👥 Employees</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.totalDepartments || 0}</h3>
            <p style={styles.statLabel}>🏢 Departments</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.totalSkills || 0}</h3>
            <p style={styles.statLabel}>🎯 Skills</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{stats.totalImages || 0}</h3>
            <p style={styles.statLabel}>📸 Images</p>
          </div>
        </div>

        <button
          style={styles.employeeBtn}
          onClick={() => navigate('/employees')}
        >
          👥 View Employees
        </button>

        {user?.role === 'admin' && (
          <button
            style={styles.adminButton}
            onClick={() => navigate('/admin')}
          >
            👑 Go to Admin Panel
          </button>
        )}

        <button style={styles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', minHeight: '100vh',
    backgroundColor: '#f0f2f5', padding: '20px'
  },
  box: {
    backgroundColor: 'white', padding: '40px',
    borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column',
    width: '400px', alignItems: 'center'
  },
  avatar: {
    width: '70px', height: '70px',
    borderRadius: '50%', backgroundColor: '#2196F3',
    color: 'white', fontSize: '30px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '15px'
  },
  welcome: { color: '#333', marginBottom: '20px', textAlign: 'center' },
  infoBox: {
    width: '100%', backgroundColor: '#f8f9fa',
    borderRadius: '8px', padding: '15px', marginBottom: '20px'
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid #eee'
  },
  label: { color: '#666', fontSize: '14px' },
  value: { color: '#333', fontSize: '14px', fontWeight: 'bold' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '10px', width: '100%', marginBottom: '20px'
  },
  statCard: {
    backgroundColor: '#f0f2f5', borderRadius: '8px',
    padding: '15px', textAlign: 'center', cursor: 'pointer'
  },
  statNumber: { color: '#2196F3', fontSize: '24px', margin: '0 0 5px 0' },
  statLabel: { color: '#666', fontSize: '12px', margin: 0 },
  employeeBtn: {
    width: '100%', padding: '10px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer', marginBottom: '10px'
  },
  adminButton: {
    padding: '10px 30px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer',
    width: '100%', marginBottom: '10px'
  },
  button: {
    padding: '10px 30px', backgroundColor: '#f44336',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer', width: '100%'
  }
};

export default Dashboard;