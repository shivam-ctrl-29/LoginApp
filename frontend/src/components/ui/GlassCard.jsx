import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const GlassCard = ({ children, style = {}, onClick, className = '', hover = false }) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      className={`${hover ? 'card-hover' : ''} ${className}`}
      style={{
        background: theme.colors.glass,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${theme.colors.glassBorder}`,
        borderRadius: 16,
        boxShadow: theme.colors.glassShadow,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default GlassCard;
