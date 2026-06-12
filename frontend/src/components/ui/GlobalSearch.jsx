/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Mail, Briefcase, Building2, User } from 'lucide-react';
import API_URL from '../../config/api';

function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
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
        const res = await axios.get(API_URL + '/api/v1/employees/search/global?q=' + encodeURIComponent(query), { headers: { Authorization: token } });
        setResults(res.data || []);
        setOpen(true);
      } catch (err) { }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]); // eslint-disable-line

  const handleSelect = (emp) => {
    navigate('/employees');
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: 400 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, color: focused ? 'var(--accent)' : 'var(--text-muted)', pointerEvents: 'none', transition: 'color 0.2s' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search employees..."
          style={{
            width: '100%', height: 36, padding: '0 32px 0 34px',
            background: 'var(--bg-elevated)',
            border: focused ? '1px solid var(--accent)' : '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)', fontSize: 13, outline: 'none',
            boxSizing: 'border-box', transition: 'var(--transition)',
            boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} style={{ position: 'absolute', right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', zIndex: 3000,
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
          animation: 'fadeInUp 0.15s ease',
        }}>
          {loading ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Searching...</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results for "{query}"</div>
          ) : results.map(emp => (
            <div key={emp.id} onClick={() => handleSelect(emp)}
              style={{ padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {emp.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  {emp.email && <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={10} />{emp.email}</span>}
                  {emp.designation && <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}><Briefcase size={10} />{emp.designation}</span>}
                  {emp.department && <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}><Building2 size={10} />{emp.department}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
