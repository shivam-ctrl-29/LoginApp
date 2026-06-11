// eslint-disable
// eslint-disable
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

function EmployeeList() {
  const navigate = useNavigate();
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => { // eslint-disable-line
    fetchEmployees();
  }, []); // eslint-disable-line

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/v1/employees`, {
        headers: { Authorization: token },
      });
      const data = res.data;
      setEmployees(Array.isArray(data) ? data : (data.employees || []));
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/v1/employees/${deleteId}`, {
        headers: { Authorization: token },
      });
      toast.success('Employee deleted successfully');
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const departments = [...new Set(employees.map(e => e.department_name).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'all' || emp.department_name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
  };

  const getDeptColor = (dept) => {
    const colors = {
      'Engineering': '#6366f1',
      'Sales': '#22c55e',
      'Marketing': '#f59e0b',
      'HR': '#8b5cf6',
      'Finance': '#ef4444',
    };
    return colors[dept] || '#64748b';
  };

  if (loading) {
    return (
      <AppLayout>
        <TableSkeleton rows={6} cols={5} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              Employees
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                padding: '4px 12px',
                borderRadius: 20,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {employees.length} total
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                across your organization
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/employees/create')}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--gradient)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>



        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedDept('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 20,
              border: selectedDept === 'all' ? 'none' : '1px solid var(--border)',
              background: selectedDept === 'all' ? 'var(--accent)' : 'var(--bg-surface)',
              color: selectedDept === 'all' ? '#fff' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
            }}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: selectedDept === dept ? 'none' : '1px solid var(--border)',
                background: selectedDept === dept ? 'var(--accent)' : 'var(--bg-surface)',
                color: selectedDept === dept ? '#fff' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 20,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{
              position: 'sticky',
              top: 0,
              background: 'var(--bg-elevated)',
              zIndex: 10,
            }}>
              <tr>
                {['Employee', 'Department', 'Designation', 'Salary', 'Actions'].map((header, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: '16px 20px',
                      textAlign: idx === 4 ? 'right' : 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: 80,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                  }}>
                    No employees found. Add your first team member!
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    onMouseEnter={() => setHoveredRow(emp.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      height: 64,
                      transition: 'background 0.15s ease',
                      background: hoveredRow === emp.id ? 'var(--bg-hover)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'var(--gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                        }}>
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 12,
                        background: `${getDeptColor(emp.department_name)}20`,
                        color: getDeptColor(emp.department_name),
                        fontSize: 12,
                        fontWeight: 500,
                      }}>
                        {emp.department_name || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>
                      {emp.designation || '—'}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                      }}>
                        ₹{Number(emp.salary).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                      }}>
                        <button
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(emp.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: '1px solid var(--border)',
                            background: 'var(--danger-soft)',
                            color: 'var(--danger)',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--danger-soft)'; }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: currentPage === 1 ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: currentPage === totalPages ? 'var(--bg-elevated)' : 'var(--bg-surface)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
            }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            maxWidth: 400,
            width: '90%',
            border: '1px solid var(--border)',
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}>
              Delete Employee
            </h3>
            <p style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              marginBottom: 24,
              lineHeight: 1.5,
            }}>
              This action cannot be undone. The employee record and associated data will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
                onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </AppLayout>
);
}

export default EmployeeList;
