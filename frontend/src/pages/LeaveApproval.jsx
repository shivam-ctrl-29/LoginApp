import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

function LeaveApproval() {
  const navigate = useNavigate();
  const { getToken, API_URL, canApprove } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [remarks, setRemarks] = useState({});

  useEffect(() => { // eslint-disable-line
  if (!canApprove) {
    navigate('/dashboard');
    return;
  }
  fetchLeaves();
 }, [canApprove]); // eslint-disable-line

  const fetchLeaves = async () => {
    const token = getToken();
    try {
      const res = await axios.get(`${API_URL}/api/leave/all`, {
        headers: { Authorization: token }
      });
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const token = getToken();
    try {
      await axios.put(`${API_URL}/api/leave/action/${id}`,
        { action, remarks: remarks[id] || '' },
        { headers: { Authorization: token } }
      );
      setMessage(`Leave ${action} successfully!`);
      fetchLeaves();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
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
        <h2 style={styles.title}>✅ Leave Approval Panel</h2>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {leaves.length === 0 ? (
        <div style={styles.empty}>No leave applications found!</div>
      ) : (
        leaves.map(leave => (
          <div key={leave.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.empName}>👤 {leave.employee_name}</h3>
                <p style={styles.empEmail}>{leave.email}</p>
              </div>
              <span style={{
                ...styles.badge,
                backgroundColor: getStatusColor(leave.status)
              }}>
                {leave.status}
              </span>
            </div>

            <div style={styles.cardBody}>
              <p>📋 <strong>Leave Type:</strong> {leave.leave_name}</p>
              <p>📅 <strong>From:</strong> {new Date(leave.from_date).toLocaleDateString()}</p>
              <p>📅 <strong>To:</strong> {new Date(leave.to_date).toLocaleDateString()}</p>
              <p>⏱️ <strong>Days:</strong> {leave.total_days}</p>
              <p>💬 <strong>Reason:</strong> {leave.reason}</p>
            </div>

            {leave.status === 'pending' && (
              <div style={styles.cardFooter}>
                <input
                  style={styles.remarksInput}
                  placeholder="Add remarks (optional)"
                  onChange={e => setRemarks({...remarks, [leave.id]: e.target.value})}
                />
                <div style={styles.actionBtns}>
                  <button
                    style={styles.approveBtn}
                    onClick={() => handleAction(leave.id, 'approved')}
                  >
                    ✅ Approve
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={() => handleAction(leave.id, 'rejected')}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
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
  backBtn: {
    padding: '10px 20px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  },
  message: {
    backgroundColor: '#e8f5e9', padding: '10px',
    borderRadius: '5px', color: '#4CAF50',
    marginBottom: '15px', textAlign: 'center'
  },
  empty: { textAlign: 'center', padding: '50px', color: '#666' },
  card: {
    backgroundColor: 'white', borderRadius: '10px',
    padding: '20px', marginBottom: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '15px'
  },
  empName: { color: '#333', margin: 0 },
  empEmail: { color: '#666', fontSize: '13px', margin: '3px 0' },
  badge: {
    color: 'white', padding: '5px 15px',
    borderRadius: '12px', fontSize: '13px'
  },
  cardBody: { color: '#555', fontSize: '14px', lineHeight: '1.8' },
  cardFooter: { marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' },
  remarksInput: {
    width: '100%', padding: '8px',
    borderRadius: '5px', border: '1px solid #ddd',
    fontSize: '14px', marginBottom: '10px',
    boxSizing: 'border-box'
  },
  actionBtns: { display: 'flex', gap: '10px' },
  approveBtn: {
    flex: 1, padding: '10px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  },
  rejectBtn: {
    flex: 1, padding: '10px', backgroundColor: '#f44336',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  }
};

export default LeaveApproval;