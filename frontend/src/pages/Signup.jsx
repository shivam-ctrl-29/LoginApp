import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await axios.post('https://loginapp-backend.onrender.com/api/auth/signup', {
        name, email, password
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>Create Account</h2>

        <input
          style={styles.input}
          placeholder="Your Name"
          onChange={e => setName(e.target.value)}
        />
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

        <button style={styles.button} onClick={handleSignup}>
          Register
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.switchText}>
          Already have an account?{' '}
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
  title: { textAlign: 'center', marginBottom: '20px', color: '#333' },
  input: {
    padding: '10px', marginBottom: '15px',
    borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px'
  },
  button: {
    padding: '10px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    fontSize: '16px', cursor: 'pointer'
  },
  message: { textAlign: 'center', marginTop: '15px', color: '#4CAF50' },
  switchText: { textAlign: 'center', marginTop: '15px', fontSize: '14px' },
  link: { color: '#2196F3', cursor: 'pointer', fontWeight: 'bold' }
};

export default Signup;