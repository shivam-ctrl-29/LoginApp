import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { theme } = useTheme();

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const toast = useMemoHelpers(showToast);

  const containerStyle = {
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    pointerEvents: 'none',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={containerStyle}>
        {toasts.map(t => {
          const Icon = ICONS[t.type] || Info;
          const colorKey = COLORS[t.type] || 'info';
          return (
            <div
              key={t.id}
              className="toast-enter"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 14,
                background: theme.colors.glass,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${theme.colors.glassBorder}`,
                boxShadow: theme.colors.glassShadow,
                minWidth: 280,
                maxWidth: 400,
                color: theme.colors.text,
              }}
            >
              <Icon size={20} color={theme.colors[colorKey]} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textMuted,
                  padding: 4,
                  display: 'flex',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

function useMemoHelpers(showToast) {
  return {
    show: showToast,
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration),
  };
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
