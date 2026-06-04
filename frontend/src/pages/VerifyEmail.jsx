import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/auth/verify-email/${token}`
        );
        setMessage(res.data.message);
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 3000);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Verification failed');
        setIsSuccess(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.icon}>
          {isSuccess ? '✅' : '⏳'}
        </div>
        <h2 style={styles.title}>Email Verification</h2>
        <p style={{
          ...styles.message,
          color: isSuccess ? '#4CAF50' : '#666'
        }}>
          {message}
        </p>
        {isSuccess && (
          <p style={styles.redirect}>
            Redirecting to login in 3 seconds...
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
    display: 'flex', flexDirection: 'column',
    width: '300px', alignItems: 'center'
  },
  icon: { fontSize: '50px', marginBottom: '20px' },
  title: { color: '#333', marginBottom: '15px' },
  message: { textAlign: 'center', fontSize: '15px' },
  redirect: { color: '#999', fontSize: '13px', marginTop: '10px' }
};

export default VerifyEmail;