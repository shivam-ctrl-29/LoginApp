import React from 'react';
import GlassCard from './GlassCard';
import { useTheme } from '../../theme/ThemeContext';

const BarChart = ({ data, colors }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, paddingTop: 10 }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: colors[i % colors.length] }}>{d.value}</span>
          <div
            className="bar-grow"
            style={{
              width: '100%',
              height: `${(d.value / max) * 100}%`,
              minHeight: 4,
              borderRadius: '6px 6px 2px 2px',
              background: `linear-gradient(180deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}88)`,
              transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          <span style={{ fontSize: 10, color: '#8b93a8', fontWeight: 500 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const DonutChart = ({ segments, size = 120 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let cumulative = 0;
  const r = 40;
  const cx = 50;
  const cy = 50;

  const paths = segments.map(seg => {
    const pct = seg.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return <path key={seg.label} d={d} fill={seg.color} opacity={0.9} />;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {paths}
        <circle cx={cx} cy={cy} r={22} fill="transparent" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map(seg => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: seg.color }} />
            <span style={{ color: '#8b93a8' }}>{seg.label}</span>
            <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, type = 'bar', data = [], segments = [] }) => {
  const { theme } = useTheme();
  const chartColors = [theme.colors.chart1, theme.colors.chart2, theme.colors.chart3, theme.colors.chart4];

  return (
    <GlassCard style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: theme.colors.text }}>{title}</h3>
        {subtitle && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: theme.colors.textMuted }}>{subtitle}</p>
        )}
      </div>
      {type === 'bar' && <BarChart data={data} colors={chartColors} />}
      {type === 'donut' && <DonutChart segments={segments} />}
    </GlassCard>
  );
};

export default ChartCard;
