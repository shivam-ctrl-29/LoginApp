import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await axios.post('https://shivamloginapp-backend.onrender.com/api/auth/login', {
      email, password
    });
    // Save BOTH tokens
    localStorage.setItem('token', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setMessage(res.data.message);
    setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong');
      }
    };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Welcome Back</h2>

        <input
          style={styles.input}
          placeholder="Email"
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        {message && <p style={styles.message}>{message}</p>}
        <p style={styles.switchText}>
        <span style={styles.link} onClick={() => navigate('/forgot-password')}>
         Forgot Password?
        </span>
         </p>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <span style={styles.link} onClick={() => navigate('/signup')}>
            Sign up here
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
  title: { textAlign: 'center', marginBottom: '20px', color: '#333' },
  input: {
    padding: '10px', marginBottom: '15px',
    borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px'
  },
  button: {
    padding: '10px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer'
  },
  message: { textAlign: 'center', marginTop: '15px', color: '#2196F3' },
  switchText: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },
  link: { color: '#4CAF50', cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;