import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

const PageHeader = ({ title, subtitle, actions }) => {
  const { theme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 28,
    }}>
      <div>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          color: theme.colors.text,
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: 14, color: theme.colors.textSecondary }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
