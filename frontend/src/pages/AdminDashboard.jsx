import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Shield, Users, Search, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import API_URL from '../config/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/users`, {
        headers: { Authorization: token },
      });
      setUsers(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Access denied. Admins only.');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load users');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/v1/admin/users/${deleteId}`, {
        headers: { Authorization: token },
      });
      toast.success('User deleted successfully');
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const employeeCount = users.filter(u => u.role !== 'admin').length;
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))];

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': '#6366f1',
      'hr': '#22c55e',
      'manager': '#f59e0b',
      'employee': '#64748b',
    };
    return colors[role] || '#64748b';
  };

  const getRoleBg = (role) => {
    const colors = {
      'admin': 'rgba(99,102,241,0.12)',
      'hr': 'rgba(34,197,94,0.12)',
      'manager': 'rgba(245,158,11,0.12)',
      'employee': 'rgba(100,116,139,0.12)',
    };
    return colors[role] || 'rgba(100,116,139,0.12)';
  };

  if (loading) {
    return (
      <AppLayout>
        <TableSkeleton rows={5} cols={3} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Manage system users and access control
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={20} color="#fff" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Total Users</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{users.length}</div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={20} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Administrators</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{adminCount}</div>
          </div>

          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            border: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--success-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={20} color="var(--success)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Other Roles</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{employeeCount}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
            <Search size={16} style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: 44,
                padding: '0 14px 0 40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 4,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {['all', ...roles].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 20,
                  border: roleFilter === role ? 'none' : '1px solid var(--border)',
                  background: roleFilter === role ? 'var(--accent)' : 'var(--bg-surface)',
                  color: roleFilter === role ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-elevated)' }}>
              <tr>
                {['User', 'Email', 'Role', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 600,
                      }}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      background: getRoleBg(user.role),
                      color: getRoleColor(user.role),
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {user.role !== 'admin' ? (
                      <button
                        onClick={() => setDeleteId(user.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                          background: 'var(--danger-soft)',
                          color: 'var(--danger)',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: 420, maxWidth: '90vw', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 18, fontWeight: 700 }}>Delete User</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                This will permanently remove the user account and all associated data. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleDelete}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: 'inherit',
                  }}
                >
                  Delete User
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
