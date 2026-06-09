import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, User, Mail, Briefcase, Building2 } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import API_URL from '../../config/api';

function GlobalSearch() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL + '/api/employees/search/global?q=' + encodeURIComponent(query), { headers: { Authorization: token } });
        setResults(res.data || []);
        setOpen(true);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (emp) => {
    navigate('/employees');
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, color: theme.colors.textMuted, pointerEvents: 'none' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search employees by name, email, department, skills..."
          style={{ width: '100%', padding: '10px 36px 10px 36px', background: theme.colors.glass, border: '1px solid ' + theme.colors.border, borderRadius: 10, color: theme.colors.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} style={{ position: 'absolute', right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: theme.colors.surface || theme.colors.card, border: '1px solid ' + theme.colors.border, borderRadius: 12, zIndex: 3000, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 16, textAlign: 'center', color: theme.colors.textMuted, fontSize: 13 }}>Searching...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: theme.colors.textMuted, fontSize: 13 }}>No results found for "{query}"</div>
          ) : (
            results.map(emp => (
              <div key={emp.id} onClick={() => handleSelect(emp)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid ' + theme.colors.border, display: 'flex', gap: 12, alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = theme.colors.glass}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {emp.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text }}>{emp.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 3 }}>
                    {emp.email && <span style={{ fontSize: 11, color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={10} />{emp.email}</span>}
                    {emp.designation && <span style={{ fontSize: 11, color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: 3 }}><Briefcase size={10} />{emp.designation}</span>}
                    {emp.department && <span style={{ fontSize: 11, color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: 3 }}><Building2 size={10} />{emp.department}</span>}
                  </div>
                  {emp.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {emp.skills.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#6366f122', color: '#6366f1' }}>{s}</span>
                      ))}
                      {emp.skills.length > 3 && <span style={{ fontSize: 10, color: theme.colors.textMuted }}>+{emp.skills.length - 3} more</span>}
                    </div>
                  )}
                </div>
                <User size={14} color={theme.colors.textMuted} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
