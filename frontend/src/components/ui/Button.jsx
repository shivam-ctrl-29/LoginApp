import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';

const VARIANTS = {
  primary: (t, hovered) => ({
    background: hovered
      ? `linear-gradient(135deg, ${t.colors.accent}, #c73a52)`
      : `linear-gradient(135deg, ${t.colors.accent}, #d63d56)`,
    color: t.colors.white,
    border: 'none',
  }),
  secondary: (t, hovered) => ({
    background: hovered ? `${t.colors.blue}33` : `${t.colors.blue}18`,
    color: t.colors.blue,
    border: `1px solid ${t.colors.border}`,
  }),
  ghost: (t, hovered) => ({
    background: hovered ? `${t.colors.accent}12` : 'transparent',
    color: t.colors.text,
    border: 'none',
  }),
  danger: (t, hovered) => ({
    background: hovered ? t.colors.danger : `${t.colors.danger}dd`,
    color: t.colors.white,
    border: 'none',
  }),
  success: (t, hovered) => ({
    background: hovered ? t.colors.success : `${t.colors.success}dd`,
    color: t.colors.white,
    border: 'none',
  }),
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  style = {},
}) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  const sizes = {
    sm: { padding: '8px 14px', fontSize: 13 },
    md: { padding: '11px 20px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 15 },
  };

  const v = VARIANTS[variant]?.(theme, hovered && !disabled) || VARIANTS.primary(theme, hovered);

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="btn-hover"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'inherit',
        ...sizes[size],
        ...v,
        ...style,
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
};

export default Button;
