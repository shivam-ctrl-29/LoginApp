import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Plus, UserCheck, RotateCcw, Trash2, Eye } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import PageHeader from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import { useTheme } from '../theme/ThemeContext';
import API_URL from '../config/api';

const STATUS_COLORS = { available: 'success', allocated: 'warning', returned: 'info', damaged: 'danger', lost: 'danger' };

function Assets() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  const fetchAssets = async () => {
    try {
      const res = await axios.get(API_URL + '/api/v1/assets', { headers });
      const list = Array.isArray(res.data) ? res.data : (res.data.assets || []);
      setAssets(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_URL + '/api/v1/employees', { headers });
      setEmployees(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAssets(); fetchEmployees(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAllocate = async () => {
    if (!selectedEmployee) return setMsg('Please select an employee');
    setActionLoading(true);
    try {
      await axios.post(API_URL + '/api/v1/assets/allocate', { assetId: modal.asset.id, employeeId: parseInt(selectedEmployee) }, { headers });
      setMsg('Asset allocated successfully!');
      setModal(null);
      fetchAssets();
    } catch (err) { setMsg(err.response?.data?.message || 'Error allocating asset'); }
    finally { setActionLoading(false); }
  };

  const handleReturn = async () => {
    if (!selectedEmployee) return setMsg('Please select the employee');
    setActionLoading(true);
    try {
      await axios.post(API_URL + '/api/v1/assets/return', { assetId: modal.asset.id, employeeId: parseInt(selectedEmployee) }, { headers });
      setMsg('Asset returned successfully!');
      setModal(null);
      fetchAssets();
    } catch (err) { setMsg(err.response?.data?.message || 'Error returning asset'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await axios.delete(API_URL + '/api/v1/assets/' + id, { headers });
      fetchAssets();
    } catch (err) { alert(err.response?.data?.message || 'Error deleting asset'); }
  };

  const openModal = (type, asset) => { setSelectedEmployee(''); setMsg(''); setModal({ type, asset }); };

  return (
    <AppLayout>
      <PageHeader
        title="Asset Management"
        subtitle="Track, assign and return company assets"
        actions={
          <button onClick={() => navigate('/assets/add')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: theme.colors.blue, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            <Plus size={16} /> Add Asset
          </button>
        }
      />

      {msg && <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 10, background: msg.includes('success') ? '#22c55e22' : '#ef444422', color: msg.includes('success') ? '#22c55e' : '#ef4444', fontSize: 14 }}>{msg}</div>}

      {loading ? (
        <div style={{ color: theme.colors.textSecondary, padding: 40, textAlign: 'center' }}>Loading assets...</div>
      ) : assets.length === 0 ? (
        <GlassCard style={{ padding: 60, textAlign: 'center' }}>
          <Package size={48} color={theme.colors.textMuted} style={{ marginBottom: 12 }} />
          <div style={{ color: theme.colors.textSecondary, fontSize: 15 }}>No assets found. Add your first asset!</div>
        </GlassCard>
      ) : (
        <GlassCard style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid ' + theme.colors.border }}>
                {['Code', 'Name', 'Type', 'Purchase Cost', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid ' + theme.colors.border }}>
                  <td style={tdStyle(theme)}>{asset.assetCode}</td>
                  <td style={{ ...tdStyle(theme), fontWeight: 600, color: theme.colors.text }}>{asset.assetName}</td>
                  <td style={tdStyle(theme)}>{asset.assetType}</td>
                  <td style={tdStyle(theme)}>{asset.purchaseCost ? 'Rs ' + Number(asset.purchaseCost).toLocaleString() : '-'}</td>
                  <td style={tdStyle(theme)}><Badge variant={STATUS_COLORS[asset.status] || 'info'}>{asset.status}</Badge></td>
                  <td style={tdStyle(theme)}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn icon={Eye} color={theme.colors.info} title="Edit" onClick={() => navigate('/assets/edit/' + asset.id)} />
                      {asset.status === 'available' && <ActionBtn icon={UserCheck} color={theme.colors.warning} title="Allocate" onClick={() => openModal('allocate', asset)} />}
                      {asset.status === 'allocated' && <ActionBtn icon={RotateCcw} color={theme.colors.success} title="Return" onClick={() => openModal('return', asset)} />}
                      <ActionBtn icon={Trash2} color={theme.colors.danger} title="Delete" onClick={() => handleDelete(asset.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard style={{ padding: 32, width: 420, maxWidth: '90vw' }}>
            <h3 style={{ margin: '0 0 8px', color: theme.colors.text, fontSize: 18, fontWeight: 700 }}>
              {modal.type === 'allocate' ? 'Allocate Asset' : 'Return Asset'}
            </h3>
            <p style={{ color: theme.colors.textSecondary, fontSize: 13, marginBottom: 20 }}>
              Asset: <strong style={{ color: theme.colors.text }}>{modal.asset.assetName}</strong> ({modal.asset.assetCode})
            </p>
            <label style={labelStyle(theme)}>Select Employee</label>
            <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} style={selectStyle(theme)}>
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.userId || emp.id} value={emp.userId || emp.id}>{emp.name || emp.user?.name} - {emp.designation || 'N/A'}</option>
              ))}
            </select>
            {msg && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={modal.type === 'allocate' ? handleAllocate : handleReturn} disabled={actionLoading} style={{ flex: 1, padding: '10px 0', background: modal.type === 'allocate' ? theme.colors.warning : theme.colors.success, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                {actionLoading ? 'Processing...' : modal.type === 'allocate' ? 'Allocate' : 'Return'}
              </button>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '10px 0', background: theme.colors.glass, color: theme.colors.text, border: '1px solid ' + theme.colors.border, borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </GlassCard>
        </div>
      )}
    </AppLayout>
  );
}

function ActionBtn({ icon: Icon, color, title, onClick }) {
  return (
    <button title={title} onClick={onClick} style={{ background: color + '22', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color }}>
      <Icon size={15} />
    </button>
  );
}

const tdStyle = (theme) => ({ padding: '12px 16px', fontSize: 13, color: theme.colors.textSecondary });
const labelStyle = (theme) => ({ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: 6 });
const selectStyle = (theme) => ({ width: '100%', padding: '10px 12px', background: theme.colors.glass, border: '1px solid ' + theme.colors.border, borderRadius: 8, color: theme.colors.text, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' });

export default Assets;
