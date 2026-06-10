import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

const ASSET_TYPES = ['Laptop', 'Monitor', 'Mouse', 'Keyboard', 'Mobile', 'ID Card', 'Access Card', 'Software License', 'Headset', 'Other'];
const ASSET_STATUSES = ['available', 'allocated', 'returned', 'damaged', 'lost'];

function AddAsset() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ assetCode: '', assetName: '', assetType: '', purchaseDate: '', purchaseCost: '', status: 'available' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <AppLayout>
      <PageHeader title={isEdit ? 'Edit Asset' : 'Add New Asset'} subtitle={isEdit ? 'Update asset details' : 'Register a new company asset'} />
      <GlassCard style={{ maxWidth: 600, padding: 32 }}>
        {error && <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#ef444422', color: '#ef4444', fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Asset Code *" name="assetCode" value={form.assetCode} onChange={handleChange} placeholder="e.g. LAP-001" theme={theme} />
          <Field label="Asset Name *" name="assetName" value={form.assetName} onChange={handleChange} placeholder="e.g. Dell Laptop" theme={theme} />
          <div>
            <label style={labelStyle(theme)}>Asset Type *</label>
            <select name="assetType" value={form.assetType} onChange={handleChange} style={inputStyle(theme)}>
              <option value="">-- Select Type --</option>
              {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle(theme)}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} style={inputStyle(theme)}>
              {ASSET_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <Field label="Purchase Date" name="purchaseDate" value={form.purchaseDate} onChange={handleChange} type="date" theme={theme} />
          <Field label="Purchase Cost (Rs)" name="purchaseCost" value={form.purchaseCost} onChange={handleChange} placeholder="e.g. 75000" type="number" theme={theme} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '12px 0', background: theme.colors.blue, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Add Asset'}
          </button>
          <button onClick={() => navigate('/assets')} style={{ flex: 1, padding: '12px 0', background: theme.colors.glass, color: theme.colors.text, border: '1px solid ' + theme.colors.border, borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 15 }}>
            Cancel
          </button>
        </div>
      </GlassCard>
    </AppLayout>
  );
}

function Field({ label, name, value, onChange, placeholder, type = 'text', theme }) {
  return (
    <div>
      <label style={labelStyle(theme)}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle(theme)} />
    </div>
  );
}

const labelStyle = (theme) => ({ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: 6 });
const inputStyle = (theme) => ({ width: '100%', padding: '10px 12px', background: theme.colors.glass, border: '1px solid ' + theme.colors.border, borderRadius: 8, color: theme.colors.text, fontSize: 14, boxSizing: 'border-box' });

export default AddAsset;
