import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import Button from './Button';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = true }) => {
  const { theme } = useTheme();

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.colors.overlay,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        className="modal-enter"
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.colors.glass,
          backdropFilter: 'blur(24px)',
          border: `1px solid ${theme.colors.glassBorder}`,
          borderRadius: 20,
          padding: 32,
          maxWidth: 420,
          width: '100%',
          boxShadow: theme.colors.glassShadow,
        }}
      >
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `${theme.colors.danger}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <AlertTriangle size={26} color={theme.colors.danger} />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: theme.colors.text }}>{title}</h3>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: theme.colors.textSecondary, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="ghost" onClick={onCancel} fullWidth>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} fullWidth>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
