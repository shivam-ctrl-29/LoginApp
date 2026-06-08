import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import GlassCard from './GlassCard';
import { useTheme } from '../../theme/ThemeContext';

const DataTable = ({
  columns,
  data,
  searchKeys = [],
  filterKey,
  filterOptions = [],
  emptyMessage = 'No data found',
  actions,
}) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let result = data;
    if (search && searchKeys.length) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        searchKeys.some(key => String(row[key] ?? '').toLowerCase().includes(q))
      );
    }
    if (filter !== 'all' && filterKey) {
      result = result.filter(row => row[filterKey] === filter);
    }
    return result;
  }, [data, search, filter, searchKeys, filterKey]);

  return (
    <GlassCard style={{ overflow: 'hidden', padding: 0 }}>
      {(searchKeys.length > 0 || filterOptions.length > 0) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}>
          {searchKeys.length > 0 && (
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textMuted,
                }}
              />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  borderRadius: 10,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.inputBg,
                  color: theme.colors.text,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
          {filterOptions.length > 0 && (
            <div style={{ position: 'relative', minWidth: 160 }}>
              <Filter
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textMuted,
                  pointerEvents: 'none',
                }}
              />
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 32px 10px 36px',
                  borderRadius: 10,
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.inputBg,
                  color: theme.colors.text,
                  fontSize: 14,
                  fontFamily: 'inherit',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All</option>
                {filterOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.colors.textMuted,
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: `${theme.colors.blue}08` }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: theme.colors.textMuted,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th style={{
                  padding: '14px 20px',
                  textAlign: 'right',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: theme.colors.textMuted,
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={{ padding: 48, textAlign: 'center', color: theme.colors.textMuted, fontSize: 14 }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className="table-row-hover"
                  style={{ borderBottom: `1px solid ${theme.colors.border}` }}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '14px 20px',
                        fontSize: 14,
                        color: theme.colors.text,
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '14px 20px', textAlign: 'right', verticalAlign: 'middle' }}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid ${theme.colors.border}`,
          fontSize: 12,
          color: theme.colors.textMuted,
        }}>
          Showing {filtered.length} of {data.length} records
        </div>
      )}
    </GlassCard>
  );
};

export default DataTable;
