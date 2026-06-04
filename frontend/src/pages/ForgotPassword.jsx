import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        'https://loginapp-backend.onrender.com/api/auth/forgot-password',
        { email }
      );
      setMessage(res.data.message);
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
      setIsSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🔑 Forgot Password</h2>
        <p style={styles.subtitle}>
          Enter your email and we'll send you a reset link
        </p>

        <input
          style={styles.input}
          placeholder="Your Email"
          onChange={e => setEmail(e.target.value)}
        />

        <button style={styles.button} onClick={handleSubmit}>
          Send Reset Link
        </button>

        {message && (
          <p style={{
            ...styles.message,
            color: isSuccess ? '#4CAF50' : 'red'
          }}>
            {message}
          </p>
        )}

        <p style={styles.switchText}>
          Remember your password?{' '}
          <span style={styles.link} onClick={() => navigate('/')}>
            Login here
          </span>
        </p>
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
    padding: '10px', backgroundColor: '#FF9800',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer'
  },
  message: { textAlign: 'center', marginTop: '15px' },
  switchText: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },
  link: { color: '#2196F3', cursor: 'pointer', fontWeight: 'bold' }
};

export default ForgotPassword;