import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, CalendarPlus, CalendarDays,
  CheckSquare, Shield, LogOut, Moon, Sun, Menu, X, Building2,
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import useAuth from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/employees/create', label: 'Add Employee', icon: UserPlus },
  { path: '/leave/apply', label: 'Apply Leave', icon: CalendarPlus },
  { path: '/leave/my', label: 'My Leaves', icon: CalendarDays },
  { path: '/leave/approval', label: 'Approvals', icon: CheckSquare, roles: ['admin', 'hr', 'manager'] },
  { path: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
];

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, handleLogout, isAdmin, canApprove } = useAuth();

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    if (item.roles.includes('admin') && isAdmin) return true;
    if (item.path === '/leave/approval' && canApprove) return true;
    return false;
  });

  const isActive = (path) => {
    if (path === '/employees') return location.pathname === '/employees';
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <>
      <div style={{ padding: '24px 20px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.blue})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Building2 size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              i-SOFTZONE
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em' }}>
              HRMS
            </div>
          </div>
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
                padding: '12px 14px',
                marginBottom: 4,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                background: active ? theme.colors.sidebarActive : 'transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = theme.colors.sidebarHover; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? theme.colors.sidebarActive : 'transparent'; }}
            >
              <Icon size={18} />
              {item.label}
              {active && (
                <div style={{
                  marginLeft: 'auto',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: theme.colors.accent,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          marginBottom: 8,
        }}>
          <Avatar name={user?.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            color: theme.colors.accent,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1001,
          width: 44,
          height: 44,
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.glass,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.text,
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            background: theme.colors.overlay,
            zIndex: 999,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 260,
          minHeight: '100vh',
          background: theme.colors.sidebarBg,
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1000,
          borderRight: `1px solid rgba(255,255,255,0.06)`,
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
