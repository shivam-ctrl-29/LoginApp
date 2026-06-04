import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  // eslint-disable-next-line
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post(
        `https://loginapp-backend.onrender.com/api/auth/reset-password`,
        { password }
      );
      setMessage(res.data.message);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setIsSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🔒 Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below</p>

        <input
          style={styles.input}
          placeholder="New Password"
          type="password"
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleReset}>
          Reset Password
        </button>

        {message && (
          <p style={{
            ...styles.message,
            color: isSuccess ? '#4CAF50' : 'red'
          }}>
            {message}
          </p>
        )}
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
    display: 'flex', flexDirection: 'column', width: '300px'
  },
  title: { textAlign: 'center', marginBottom: '10px', color: '#333' },
  subtitle: { textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px' },
  input: {
    padding: '10px', marginBottom: '15px',
    borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px'
  },
  button: {
    padding: '10px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer'
  },
  message: { textAlign: 'center', marginTop: '15px' }
};

export default ResetPassword;