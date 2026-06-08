import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from './GlassCard';
import { useTheme } from '../../theme/ThemeContext';

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp = true, onClick }) => {
  const { theme } = useTheme();
  const accentColor = color || theme.colors.accent;

  return (
    <GlassCard hover={!!onClick} onClick={onClick} style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={22} color={accentColor} />}
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: trendUp ? theme.colors.success : theme.colors.danger,
          }}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: theme.colors.text, lineHeight: 1, marginBottom: 6 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: 500 }}>
        {title}
      </div>
    </GlassCard>
  );
};

export default StatCard;
