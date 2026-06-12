/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

const DEPT_PALETTE = ['#6366f1','#10b981','#f59e0b','#8b5cf6','#ef4444','#3b82f6','#ec4899','#14b8a6'];

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
  const [searchFocused, setSearchFocused] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => { fetchEmployees(); }, []); // eslint-disable-line

  const fetchEmployees = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/v1/employees`, { headers: { Authorization: token } });
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
      await axios.delete(`${API_URL}/api/v1/employees/${deleteId}`, { headers: { Authorization: token } });
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
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';

  const getDeptColor = (dept) => {
    if (!dept) return '#64748b';
    const idx = departments.indexOf(dept) % DEPT_PALETTE.length;
    return DEPT_PALETTE[idx >= 0 ? idx : 0];
  };

  if (loading) {
    return <AppLayout><TableSkeleton rows={6} cols={5} /></AppLayout>;
  }

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Employees</h1>
              <div style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                {employees.length}
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage your entire workforce in one place</p>
          </div>
          <button
            onClick={() => navigate('/employees/create')}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'var(--transition)', boxShadow: 'var(--shadow-accent)',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
          >
            <UserPlus size={15} /> Add Employee
          </button>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '0 0 300px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
            <input
              type="text" placeholder="Search employees..." value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', height: 40, padding: '0 36px 0 38px',
                borderRadius: 'var(--radius-md)',
                border: searchFocused ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                transition: 'var(--transition)',
                boxShadow: searchFocused ? '0 0 0 3px var(--accent-glow)' : 'none',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', ...departments].map(dept => (
              <button
                key={dept}
                onClick={() => { setSelectedDept(dept); setCurrentPage(1); }}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  border: selectedDept === dept ? 'none' : '1px solid var(--border)',
                  background: selectedDept === dept ? 'var(--accent)' : 'var(--bg-surface)',
                  color: selectedDept === dept ? '#fff' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: selectedDept === dept ? 600 : 400, cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Employee', 'Department', 'Designation', 'Salary', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} style={{
                    padding: '14px 20px', textAlign: i === 5 ? 'right' : 'left',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '64px 20px', textAlign: 'center' }}>
                    <Users size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No employees found</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onMouseEnter={() => setHoveredRow(emp.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      height: 66,
                      background: hoveredRow === emp.id ? 'var(--bg-hover)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '0 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: 'var(--gradient)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                        }}>
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0 20px' }}>
                      {emp.department_name ? (
                        <span style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-full)',
                          background: `${getDeptColor(emp.department_name)}18`,
                          color: getDeptColor(emp.department_name),
                          fontSize: 11, fontWeight: 600,
                        }}>
                          {emp.department_name}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {emp.designation || '—'}
                    </td>
                    <td style={{ padding: '0 20px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        ₹{Number(emp.salary || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td style={{ padding: '0 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>Active</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate(`/employees/edit/${emp.id}`)}
                          style={{
                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(emp.id)}
                          style={{
                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(239,68,68,0.2)', background: 'var(--danger-soft)',
                            color: 'var(--danger)', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-glow)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                        >
                          <Trash2 size={13} /> Delete
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 12, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <ChevronLeft size={14} /> Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page} onClick={() => setCurrentPage(page)}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: currentPage === page ? 'none' : '1px solid var(--border)', background: currentPage === page ? 'var(--accent)' : 'var(--bg-elevated)', color: currentPage === page ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: currentPage === page ? 700 : 400, cursor: 'pointer' }}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: 12, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteId && (
          <div style={{ position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 950, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 380, width: '90%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', animation: 'modalEnter 0.25s ease' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={22} color="var(--danger)" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Delete Employee</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                This action cannot be undone. The employee record and all associated data will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = ''}
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
