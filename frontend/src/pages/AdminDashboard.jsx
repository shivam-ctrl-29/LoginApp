/* eslint-disable */
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
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/users`, { headers: { Authorization: token } });
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
      await axios.delete(`${API_URL}/api/v1/admin/users/${deleteId}`, { headers: { Authorization: token } });
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

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'NA';

  const getRoleColor = (role) => {
    const colors = { admin: '#6366f1', hr: '#10b981', manager: '#f59e0b', employee: '#64748b' };
    return colors[role] || '#64748b';
  };

  if (loading) return <AppLayout><TableSkeleton rows={5} cols={4} /></AppLayout>;

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="#fff" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Admin Panel</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage system users, roles, and permissions</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: users.length, color: '#6366f1', icon: Users },
            { label: 'Admins', value: adminCount, color: '#8b5cf6', icon: Shield },
            { label: 'Employees', value: employeeCount, color: '#10b981', icon: Users },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Icon size={15} color={card.color} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Search + Role filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '0 0 280px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: searchFocused ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
            <input
              type="text" placeholder="Search users..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              style={{ width: '100%', height: 38, padding: '0 34px 0 36px', borderRadius: 'var(--radius-md)', border: searchFocused ? '1px solid var(--accent)' : '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', transition: 'var(--transition)', boxShadow: searchFocused ? '0 0 0 3px var(--accent-glow)' : 'none' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
                <X size={13} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', ...roles].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', border: roleFilter === r ? 'none' : '1px solid var(--border)', background: roleFilter === r ? 'var(--accent)' : 'var(--bg-surface)', color: roleFilter === r ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: roleFilter === r ? 600 : 400, cursor: 'pointer', transition: 'var(--transition)', textTransform: 'capitalize' }}>
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['User', 'Email', 'Role', 'Status', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '13px 20px', textAlign: i === 4 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    <Users size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
                    <div>No users match your search</div>
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} onMouseEnter={() => setHoveredRow(user.id)} onMouseLeave={() => setHoveredRow(null)}
                  style={{ borderBottom: '1px solid var(--border)', height: 60, background: hoveredRow === user.id ? 'var(--bg-hover)' : 'transparent', transition: 'background 0.15s' }}>
                  <td style={{ padding: '0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {getInitials(user.name)}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '0 20px', fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '0 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${getRoleColor(user.role)}18`, color: getRoleColor(user.role), fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)' }}>Active</span>
                    </div>
                  </td>
                  <td style={{ padding: '0 20px', textAlign: 'right' }}>
                    <button onClick={() => setDeleteId(user.id)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-glow)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete modal */}
        {deleteId && (
          <div style={{ position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 950, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 380, width: '90%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', animation: 'modalEnter 0.25s ease' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trash2 size={22} color="var(--danger)" />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Delete User</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                This will permanently delete the user account. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteId(null)} style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                >Cancel</button>
                <button onClick={handleDelete} style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = ''}
                >Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;
