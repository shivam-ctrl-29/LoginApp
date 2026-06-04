import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import axios from 'axios';

const API_URL = 'https://shivamloginapp-backend.onrender.com';

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: token }
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        alert('Access denied! Admins only.');
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: token }
      });
      setMessage('User deleted!');
      fetchUsers();
    } catch (err) {
      setMessage('Error deleting user');
    }
  };

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

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>👑 Admin Dashboard</h2>
        <p style={styles.subtitle}>Welcome, {user?.name}! Manage all users below.</p>

        {message && <p style={styles.message}>{message}</p>}

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={styles.tableRow}>
                <td style={styles.td}>#{u.id}</td>
                <td style={styles.td}>{u.name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: u.role === 'admin' ? '#2196F3' : '#4CAF50'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={styles.td}>
                  {u.role !== 'admin' && (
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.btnRow}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            My Dashboard
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
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
    width: '100%', maxWidth: '700px'
  },
  title: { textAlign: 'center', color: '#333', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '25px' },
  message: { textAlign: 'center', color: '#4CAF50', marginBottom: '15px' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '25px' },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' },
  tableRow: { borderBottom: '1px solid #eee' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  badge: {
    color: 'white', padding: '3px 10px',
    borderRadius: '12px', fontSize: '12px'
  },
  deleteBtn: {
    backgroundColor: '#f44336', color: 'white',
    border: 'none', padding: '5px 12px',
    borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
  },
  btnRow: { display: 'flex', gap: '10px' },
  backBtn: {
    flex: 1, padding: '10px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '14px', cursor: 'pointer'
  },
  logoutBtn: {
    flex: 1, padding: '10px', backgroundColor: '#f44336',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '14px', cursor: 'pointer'
  }
};

export default AdminDashboard;