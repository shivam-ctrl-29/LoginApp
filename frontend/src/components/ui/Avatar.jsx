import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const Avatar = ({ name, src, size = 40, style = {} }) => {
  const { theme } = useTheme();
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2px solid ${theme.colors.accent}`,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.colors.blue}, ${theme.colors.accent})`,
        color: theme.colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
        ...style,
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
