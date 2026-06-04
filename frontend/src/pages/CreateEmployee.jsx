import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

function CreateEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    department_id: '',
    phone: '',
    address: '',
    designation: '',
    salary: ''
  });

  useEffect(() => {
  axios.get(`${API_URL}/api/departments`)
    .then(res => setDepartments(res.data))
    .catch(err => console.error('Departments error:', err));

  axios.get(`${API_URL}/api/skills`)
    .then(res => setSkills(res.data))
    .catch(err => console.error('Skills error:', err));
 }, []);

  const handleSkillToggle = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/employees`, {
        ...form,
        skill_ids: selectedSkills
      }, { headers: { Authorization: token } });

      const employeeId = res.data.employee.id;

      // Upload images if any
      if (images.length > 0) {
        const formData = new FormData();
        for (const img of images) formData.append('images', img);
        await axios.post(`${API_URL}/api/employees/upload/${employeeId}`, formData, {
          headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
        });
      }

      setMessage('Employee created successfully!');
      setTimeout(() => navigate('/employees'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>➕ Create Employee</h2>

        <select
          style={styles.input}
          onChange={e => setForm({...form, department_id: e.target.value})}
        >
          <option value="">Select Department</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.department_name}</option>
          ))}
        </select>

        <input style={styles.input} placeholder="Phone"
          onChange={e => setForm({...form, phone: e.target.value})} />

        <input style={styles.input} placeholder="Address"
          onChange={e => setForm({...form, address: e.target.value})} />

        <input style={styles.input} placeholder="Designation"
          onChange={e => setForm({...form, designation: e.target.value})} />

        <input style={styles.input} placeholder="Salary" type="number"
          onChange={e => setForm({...form, salary: e.target.value})} />

        <p style={styles.label}>🎯 Select Skills:</p>
        <div style={styles.skillsContainer}>
          {skills.map(s => (
            <button
              key={s.id}
              style={{
                ...styles.skillBtn,
                backgroundColor: selectedSkills.includes(s.id) ? '#4CAF50' : '#eee',
                color: selectedSkills.includes(s.id) ? 'white' : '#333'
              }}
              onClick={() => handleSkillToggle(s.id)}
            >
              {s.skill_name}
            </button>
          ))}
        </div>

        <p style={styles.label}>📸 Upload Images (max 5):</p>
        <input
          type="file"
          multiple
          accept="image/*"
          style={styles.input}
          onChange={e => setImages(Array.from(e.target.files))}
        />

        <button style={styles.button} onClick={handleSubmit}>
          Create Employee
        </button>

        {message && <p style={styles.message}>{message}</p>}

        <button style={styles.backBtn} onClick={() => navigate('/employees')}>
          ← Back to List
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
  label: { color: '#666', fontSize: '14px', marginBottom: '8px' },
  input: {
    width: '100%', padding: '10px', marginBottom: '15px',
    borderRadius: '5px', border: '1px solid #ddd',
    fontSize: '14px', boxSizing: 'border-box'
  },
  skillsContainer: {
    display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px'
  },
  skillBtn: {
    padding: '6px 14px', borderRadius: '20px',
    border: 'none', cursor: 'pointer', fontSize: '13px'
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
  message: { textAlign: 'center', color: '#4CAF50', marginTop: '10px' }
};

export default CreateEmployee;