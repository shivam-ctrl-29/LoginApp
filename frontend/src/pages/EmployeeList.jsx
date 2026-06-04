import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:4000';

function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/employees`, {
        headers: { Authorization: token }
      });
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/employees/${id}`, {
        headers: { Authorization: token }
      });
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>👥 Employee List</h2>
        <div style={styles.btnGroup}>
          <button style={styles.addBtn} onClick={() => navigate('/employees/create')}>
            + Add Employee
          </button>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Designation</th>
            <th style={styles.th}>Salary</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td colSpan="7" style={{textAlign:'center', padding:'20px', color:'#666'}}>
                No employees yet. Add one!
              </td>
            </tr>
          ) : (
            employees.map(emp => (
              <tr key={emp.id} style={styles.tableRow}>
                <td style={styles.td}>#{emp.id}</td>
                <td style={styles.td}>{emp.name}</td>
                <td style={styles.td}>{emp.email}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{emp.department_name}</span>
                </td>
                <td style={styles.td}>{emp.designation}</td>
                <td style={styles.td}>₹{emp.salary}</td>
                <td style={styles.td}>
                  <button
                    style={styles.editBtn}
                    onClick={() => navigate(`/employees/edit/${emp.id}`)}
                  >Edit</button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(emp.id)}
                  >Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px', backgroundColor: '#f0f2f5', minHeight: '100vh'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px'
  },
  title: { color: '#333' },
  btnGroup: { display: 'flex', gap: '10px' },
  addBtn: {
    padding: '10px 20px', backgroundColor: '#4CAF50',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  },
  backBtn: {
    padding: '10px 20px', backgroundColor: '#2196F3',
    color: 'white', border: 'none', borderRadius: '5px',
    cursor: 'pointer', fontSize: '14px'
  },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden' },
  tableHeader: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' },
  tableRow: { borderBottom: '1px solid #eee' },
  td: { padding: '12px', fontSize: '14px', color: '#333' },
  badge: {
    backgroundColor: '#2196F3', color: 'white',
    padding: '3px 10px', borderRadius: '12px', fontSize: '12px'
  },
  editBtn: {
    backgroundColor: '#FF9800', color: 'white',
    border: 'none', padding: '5px 10px',
    borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontSize: '12px'
  },
  deleteBtn: {
    backgroundColor: '#f44336', color: 'white',
    border: 'none', padding: '5px 10px',
    borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
  }
};

export default EmployeeList;