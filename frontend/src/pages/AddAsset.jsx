/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Package } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';

const ASSET_TYPES = ['Laptop', 'Monitor', 'Mouse', 'Keyboard', 'Mobile', 'ID Card', 'Access Card', 'Software License', 'Headset', 'Other'];
const ASSET_STATUSES = ['available', 'allocated', 'returned', 'damaged', 'lost'];

const inputStyle = (focused) => ({
  width: '100%', height: 44, padding: '0 14px',
  borderRadius: 'var(--radius-md)',
  border: focused ? '1px solid var(--accent)' : '1px solid var(--border)',
  background: 'var(--bg-elevated)', color: 'var(--text-primary)',
  fontSize: 14, outline: 'none', transition: 'var(--transition)',
  boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
});

function AddAsset() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ assetCode: '', assetName: '', assetType: '', purchaseDate: '', purchaseCost: '', status: 'available' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  useEffect(() => {
    if (isEdit) {
      axios.get(API_URL + '/api/v1/assets/' + id, { headers })
        .then(res => {
          const a = res.data.asset || res.data;
          setForm({ assetCode: a.assetCode || '', assetName: a.assetName || '', assetType: a.assetType || '', purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : '', purchaseCost: a.purchaseCost || '', status: a.status || 'available' });
        })
        .catch(() => setError('Failed to load asset'));
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.assetCode || !form.assetName || !form.assetType) return setError('Asset Code, Name and Type are required');
    setLoading(true);
    try {
      const payload = { ...form, purchaseCost: form.purchaseCost ? parseFloat(form.purchaseCost) : null, purchaseDate: form.purchaseDate || null };
      if (isEdit) { await axios.put(API_URL + '/api/v1/assets/' + id, payload, { headers }); }
      else { await axios.post(API_URL + '/api/v1/assets', payload, { headers }); }
      navigate('/assets');
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    } finally { setLoading(false); }
  };

  const fieldFocus = (key) => ({
    onFocus: () => setFocusedField(key),
    onBlur: () => setFocusedField(''),
  });

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate('/assets')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 14, padding: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={15} /> Back to Assets
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-lg)', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{isEdit ? 'Edit Asset' : 'Add New Asset'}</h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{isEdit ? 'Update asset details' : 'Register a new company asset'}</p>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          {error && (
            <div style={{ padding: '10px 14px', marginBottom: 20, borderRadius: 'var(--radius-md)', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 13, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Asset Code *</label>
              <input name="assetCode" value={form.assetCode} onChange={handleChange} placeholder="e.g. LAP-001" style={inputStyle(focusedField === 'assetCode')} {...fieldFocus('assetCode')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Asset Name *</label>
              <input name="assetName" value={form.assetName} onChange={handleChange} placeholder="e.g. Dell XPS 15" style={inputStyle(focusedField === 'assetName')} {...fieldFocus('assetName')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Asset Type *</label>
              <select name="assetType" value={form.assetType} onChange={handleChange} style={inputStyle(focusedField === 'assetType')} {...fieldFocus('assetType')}>
                <option value="">Select type...</option>
                {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle(focusedField === 'status')} {...fieldFocus('status')}>
                {ASSET_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Purchase Date</label>
              <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} style={inputStyle(focusedField === 'purchaseDate')} {...fieldFocus('purchaseDate')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Purchase Cost (₹)</label>
              <input name="purchaseCost" type="number" value={form.purchaseCost} onChange={handleChange} placeholder="0.00" style={inputStyle(focusedField === 'purchaseCost')} {...fieldFocus('purchaseCost')} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <button onClick={() => navigate('/assets')} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            >Cancel</button>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: loading ? 'var(--bg-elevated)' : 'var(--gradient)', color: loading ? 'var(--text-muted)' : '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: loading ? 'none' : 'var(--shadow-accent)', transition: 'var(--transition)' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                  Saving...
                </span>
              ) : <><Save size={15} /> {isEdit ? 'Save Changes' : 'Add Asset'}</>}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AddAsset;
