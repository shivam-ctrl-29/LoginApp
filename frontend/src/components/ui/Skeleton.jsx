import React from 'react';
import { useTheme } from '../../theme/ThemeContext';

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style = {} }) => {
  const { theme } = useTheme();
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        background: theme.mode === 'dark'
          ? 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)'
          : 'linear-gradient(90deg, rgba(15,52,96,0.06) 25%, rgba(15,52,96,0.12) 50%, rgba(15,52,96,0.06) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }}
    />
  );
};

export const StatCardSkeleton = () => {
  const { theme } = useTheme();
  return (
    <div style={{
      padding: 24,
      borderRadius: 16,
      background: theme.colors.glass,
      border: `1px solid ${theme.colors.glassBorder}`,
    }}>
      <Skeleton width={40} height={40} borderRadius={12} style={{ marginBottom: 16 }} />
      <Skeleton width="60%" height={28} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={14} />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      borderRadius: 16,
      overflow: 'hidden',
      background: theme.colors.glass,
      border: `1px solid ${theme.colors.glassBorder}`,
      padding: 20,
    }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={14} style={{ flex: 1 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={12} style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton = () => (
  <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
      <Skeleton height={220} borderRadius={16} />
      <Skeleton height={220} borderRadius={16} />
    </div>
  </div>
);

export default Skeleton;
