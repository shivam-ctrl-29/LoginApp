import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const VARIANTS = {
  default: (t) => ({ bg: `${t.colors.blue}22`, color: t.colors.blue }),
  success: (t) => ({ bg: `${t.colors.success}22`, color: t.colors.success }),
  warning: (t) => ({ bg: `${t.colors.warning}22`, color: t.colors.warning }),
  danger: (t) => ({ bg: `${t.colors.danger}22`, color: t.colors.danger }),
  accent: (t) => ({ bg: `${t.colors.accent}22`, color: t.colors.accent }),
  admin: (t) => ({ bg: `${t.colors.info}22`, color: t.colors.info }),
};

const Badge = ({ children, variant = 'default', style = {} }) => {
  const { theme } = useTheme();
  const v = VARIANTS[variant]?.(theme) || VARIANTS.default(theme);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        background: v.bg,
        color: v.color,
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const statusVariant = (status) => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  if (status === 'pending') return 'warning';
  return 'default';
};

export default Badge;
