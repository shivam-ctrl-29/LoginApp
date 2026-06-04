import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

function ApplyLeave() {
  const navigate = useNavigate();
  const { getToken, API_URL } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState([]);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    reason: ''
  });

  // eslint-disable-next-line
 useEffect(() => {
  fetchData();
 }, []);

  const fetchData = async () => {
    const token = getToken();
    try {
      const [typesRes, balanceRes] = await Promise.all([
        axios.get(`${API_URL}/api/leave/types`),
        axios.get(`${API_URL}/api/leave/balance`, {
          headers: { Authorization: token }
        })
      ]);
      setLeaveTypes(typesRes.data);
      setBalance(balanceRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getBalance = (typeId) => {
    const b = balance.find(b => b.leave_type_id === parseInt(typeId));
    return b ? b.available_days : 'N/A';
  };

  const calculateDays = () => {
    if (!form.from_date || !form.to_date) return 0;
    const from = new Date(form.from_date);
    const to = new Date(form.to_date);
    return Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async () => {
    const token = getToken();
    try {
      await axios.post(`${API_URL}/api/leave/apply`, form, {
        headers: { Authorization: token }
      });
      setMessage('Leave applied successfully!');
      setIsSuccess(true);
      setTimeout(() => navigate('/leave/my'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setIsSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>📝 Apply for Leave</h2>

        <select
          style={styles.input}
          onChange={e => setForm({...form, leave_type_id: e.target.value})}
        >
          <option value="">Select Leave Type</option>
          {leaveTypes.map(lt => (
            <option key={lt.id} value={lt.id}>
              {lt.leave_name} (Available: {getBalance(lt.id)} days)
            </option>
          ))}
        </select>

        <label style={styles.label}>From Date:</label>
        <input
          type="date" style={styles.input}
          onChange={e => setForm({...form, from_date: e.target.value})}
        />

        <label style={styles.label}>To Date:</label>
        <input
          type="date" style={styles.input}
          onChange={e => setForm({...form, to_date: e.target.value})}
        />

        {calculateDays() > 0 && (
          <p style={styles.daysInfo}>
            📅 Total Days: <strong>{calculateDays()}</strong>
          </p>
        )}

        <textarea
          style={styles.textarea}
          placeholder="Reason for leave..."
          onChange={e => setForm({...form, reason: e.target.value})}
        />

        <button style={styles.button} onClick={handleSubmit}>
          Submit Leave Application
        </button>

        {message && (
          <p style={{...styles.message, color: isSuccess ? '#4CAF50' : 'red'}}>
            {message}
          </p>
        )}

        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
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
    width: '100%', maxWidth: '500px'
  },
  title: { textAlign: 'center', color: '#333', marginBottom: '20px' },
  label: { color: '#666', fontSize: '13px', marginBottom: '5px', display: 'block' },
  input: {
    width: '100%', padding: '10px', marginBottom: '15px',
    borderRadius: '5px', border: '1px solid #ddd',
    fontSize: '14px', boxSizing: 'border-box'
  },
  textarea: {
    width: '100%', padding: '10px', marginBottom: '15px',
    borderRadius: '5px', border: '1px solid #ddd',
    fontSize: '14px', height: '100px', boxSizing: 'border-box'
  },
  daysInfo: {
    backgroundColor: '#e3f2fd', padding: '10px',
    borderRadius: '5px', marginBottom: '15px',
    color: '#1565c0', fontSize: '14px'
  },
  button: {
    width: '100%', padding: '10px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer', marginBottom: '10px'
  },
  backBtn: {
    width: '100%', padding: '10px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '14px', cursor: 'pointer'
  },
  message: { textAlign: 'center', marginTop: '10px', fontSize: '14px' }
};

export default ApplyLeave;