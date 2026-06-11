import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, CalendarPlus, CalendarDays,
  CheckSquare, Shield, LogOut, Menu, X, Building2, Package, BarChart2,
  Clock, DollarSign,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

import NotificationBell from '../ui/NotificationBell';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/employees/create', label: 'Add Employee', icon: UserPlus },
  { path: '/leave/apply', label: 'Apply Leave', icon: CalendarPlus },
  { path: '/leave/my', label: 'My Leaves', icon: CalendarDays },
  { path: '/leave/approval', label: 'Approvals', icon: CheckSquare, roles: ['admin', 'hr', 'manager'] },
  { path: '/assets', label: 'Assets', icon: Package, roles: ['admin', 'hr', 'manager'] },
  { path: '/reports', label: 'Reports', icon: BarChart2, roles: ['admin', 'hr', 'manager'] },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/payroll', label: 'My Payroll', icon: DollarSign },
  { path: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, handleLogout, isAdmin, canApprove } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    if (item.roles.includes('admin') && isAdmin) return true;
    if (item.path === '/leave/approval' && canApprove) return true;
    if (item.path === '/assets' && (isAdmin || canApprove)) return true;
    return false;
  });

  const isActive = (path) => {
    if (path === '/employees') return location.pathname === '/employees';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={22} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>i-SOFTZONE</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>HRMS</div>
            </div>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {visibleItems.map(item => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className="nav-item"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                marginBottom: 4,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-soft)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                height: 40
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={18} />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          )}
        </div>
        {!collapsed && <NotificationBell />}
        <button onClick={() => setCollapsed(!collapsed)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, marginBottom: 4 }}>
          {collapsed ? <Menu size={16} /> : <X size={16} />}
          {!collapsed && 'Collapse'}
        </button>
        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500 }}>
          <LogOut size={16} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none', position: 'fixed', top: 16, left: 16, zIndex: 1001, width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-surface)', backdropFilter: 'blur(12px)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />}
      <aside className={'sidebar ' + (mobileOpen ? 'sidebar-open' : '')} style={{ width: collapsed ? 64 : 240, minHeight: '100vh', background: '#0d0d16', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 1000, borderRight: '1px solid var(--border)', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
