/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, CalendarPlus, CalendarDays,
  CheckSquare, Shield, LogOut, Building2, Package, BarChart2,
  Clock, DollarSign, ChevronLeft, ChevronRight,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import NotificationBell from '../ui/NotificationBell';

const NAV_GROUPS = [
  {
    label: 'MAIN',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { path: '/employees', label: 'Employees', icon: Users },
      { path: '/employees/create', label: 'Add Employee', icon: UserPlus, roles: ['admin', 'hr'] },
      { path: '/leave/apply', label: 'Apply Leave', icon: CalendarPlus },
      { path: '/leave/my', label: 'My Leaves', icon: CalendarDays },
      { path: '/leave/approval', label: 'Approvals', icon: CheckSquare, roles: ['admin', 'hr', 'manager'] },
      { path: '/assets', label: 'Assets', icon: Package, roles: ['admin', 'hr', 'manager'] },
      { path: '/attendance', label: 'Attendance', icon: Clock },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { path: '/payroll', label: 'My Payroll', icon: DollarSign },
      { path: '/payroll/admin', label: 'Payroll Admin', icon: DollarSign, roles: ['admin', 'hr'] },
      { path: '/reports', label: 'Reports', icon: BarChart2, roles: ['admin', 'hr', 'manager'] },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { path: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
    ],
  },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, handleLogout, isAdmin, canApprove } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  const isVisible = (item) => {
    if (!item.roles) return true;
    if (user?.role && item.roles.includes(user.role)) return true;
    if (item.roles.includes('admin') && isAdmin) return true;
    if (item.path === '/leave/approval' && canApprove) return true;
    if (item.path === '/assets' && (isAdmin || canApprove)) return true;
    if (item.path === '/payroll/admin' && (isAdmin || user?.role === 'hr')) return true;
    if (item.path === '/reports' && canApprove) return true;
    return false;
  };

  const isActive = (path) => {
    if (path === '/employees') return location.pathname === '/employees';
    return location.pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    const map = { admin: '#6366f1', hr: '#10b981', manager: '#f59e0b', employee: '#94a3b8' };
    return map[role] || '#94a3b8';
  };

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      width: sidebarWidth,
      background: 'linear-gradient(180deg, #0a0a14 0%, #080810 100%)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 999,
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '15px 0' : '15px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 58,
        position: 'relative',
      }}>
        {!collapsed && (
          <div style={{
            position: 'absolute',
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            left: 0, top: '50%',
            transform: 'translateY(-50%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />
        )}
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-accent)',
          position: 'relative',
        }}>
          <Building2 size={18} color="#fff" strokeWidth={2} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              i-SOFTZONE
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.15em', marginTop: 2 }}>
              HRMS
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(isVisible);
          if (!visibleItems.length) return null;
          return (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <div style={{
                  fontSize: 9, fontWeight: 700, color: 'var(--text-muted)',
                  letterSpacing: '0.12em', padding: '10px 8px 4px',
                  userSelect: 'none',
                }}>
                  {group.label}
                </div>
              )}
              {collapsed && <div style={{ height: 6 }} />}
              {visibleItems.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                const hovered = hoveredItem === item.path;
                return (
                  <div key={item.path} style={{ position: 'relative' }}>
                    <button
                      onClick={() => { navigate(item.path); setMobileOpen && setMobileOpen(false); }}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: collapsed ? '10px 0' : '9px 10px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        marginBottom: 1,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        borderLeft: active && !collapsed ? '3px solid var(--accent)' : '3px solid transparent',
                        background: active ? 'var(--accent-soft)' : hovered ? 'var(--bg-hover)' : 'transparent',
                        color: active ? 'var(--accent)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        outline: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      <Icon size={17} strokeWidth={active ? 2 : 1.5} style={{ flexShrink: 0 }} />
                      {!collapsed && (
                        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>
                          {item.label}
                        </span>
                      )}
                    </button>
                    {collapsed && hovered && (
                      <div style={{
                        position: 'absolute',
                        left: 68, top: '50%', transform: 'translateY(-50%)',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '6px 10px',
                        fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                        whiteSpace: 'nowrap', zIndex: 9999,
                        boxShadow: 'var(--shadow-md)',
                        pointerEvents: 'none',
                      }}>
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            padding: '6px 8px',
            marginBottom: 8,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: collapsed ? '10px 0' : '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
            flexShrink: 0,
          }}>
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || 'User'}
                </div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  fontSize: 9, fontWeight: 700,
                  color: getRoleColor(user?.role),
                  background: `${getRoleColor(user?.role)}1a`,
                  padding: '1px 6px', borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  marginTop: 2,
                }}>
                  {user?.role || 'employee'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredLogout(true)}
                onMouseLeave={() => setHoveredLogout(false)}
                style={{
                  background: hoveredLogout ? 'var(--danger-soft)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: 6,
                  cursor: 'pointer',
                  color: hoveredLogout ? 'var(--danger)' : 'var(--text-muted)',
                  transition: 'var(--transition)',
                  display: 'flex',
                }}
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
