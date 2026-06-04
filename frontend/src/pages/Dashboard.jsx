import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser, logout } from '../redux/slices/authSlice';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      navigate('/');
    }
  }, [error, navigate]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await axios.post('https://loginapp-backend.onrender.com/api/auth/logout', { refreshToken });
    } catch (err) {
      console.log('Logout error:', err);
    }
    dispatch(logout());
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
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
            <span style={styles.label}>🆔 User ID</span>
            <span style={styles.value}>#{user?.id}</span>
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
          <div style={styles.infoRow}>
            <span style={styles.label}>✅ Status</span>
            <span style={styles.value}>Active</span>
          </div>
        </div>

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
    alignItems: 'center', height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  box: {
    backgroundColor: 'white', padding: '40px',
    borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column',
    width: '350px', alignItems: 'center'
  },
  avatar: {
    width: '70px', height: '70px',
    borderRadius: '50%', backgroundColor: '#2196F3',
    color: 'white', fontSize: '30px', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '15px'
  },
  welcome: { color: '#333', marginBottom: '25px', textAlign: 'center' },
  infoBox: {
    width: '100%', backgroundColor: '#f8f9fa',
    borderRadius: '8px', padding: '15px',
    marginBottom: '25px'
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '10px 0', borderBottom: '1px solid #eee'
  },
  label: { color: '#666', fontSize: '14px' },
  value: { color: '#333', fontSize: '14px', fontWeight: 'bold' },
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