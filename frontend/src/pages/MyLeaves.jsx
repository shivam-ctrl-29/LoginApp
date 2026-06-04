import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

function MyLeaves() {
  const navigate = useNavigate();
  const { getToken, API_URL } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line
 useEffect(() => {
  fetchLeaves();
 }, []);

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/leave/my`, {
        headers: { Authorization: token }
      });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return '#4CAF50';
    if (status === 'rejected') return '#f44336';
    return '#FF9800';
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📋 My Leave Applications</h2>
        <div style={styles.btnGroup}>
          <button style={styles.applyBtn} onClick={() => navigate('/leave/apply')}>
            + Apply Leave
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div style={styles.empty}>
          <p>No leave applications yet!</p>
          <button style={styles.applyBtn} onClick={() => navigate('/leave/apply')}>
            Apply for Leave
          </button>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Leave Type</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Days</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(leave => (
              <tr key={leave.id} style={styles.tableRow}>
                <td style={styles.td}>{leave.leave_name}</td>
                <td style={styles.td}>{new Date(leave.from_date).toLocaleDateString()}</td>
                <td style={styles.td}>{new Date(leave.to_date).toLocaleDateString()}</td>
                <td style={styles.td}>{leave.total_days}</td>
                <td style={styles.td}>{leave.reason}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(leave.status)
                  }}>
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px'
  },
  title: { color: '#333' },
  btnGroup: { display: 'flex', gap: '10px' },
  applyBtn: {
    padding: '10px 20px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  },
  backBtn: {
    padding: '10px 20px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  },
  empty: { textAlign: 'center', padding: '50px', color: '#666' },
  table: {
    width: '100%', borderCollapse: 'collapse',
    backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden'
  },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' },
  tableRow: { borderBottom: '1px solid #eee' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  badge: {
    color: 'white', padding: '4px 12px',
    borderRadius: '12px', fontSize: '12px'
  }
};

export default MyLeaves;