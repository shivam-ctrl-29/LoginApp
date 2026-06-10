// eslint-disable
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Plus, UserCheck, RotateCcw, Trash2, Eye, LayoutGrid, List, DollarSign } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';



function Assets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [viewMode, setViewMode] = useState('table');
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

  const getStatusColor = (status) => {
    const colors = {
      'available': '#22c55e',
      'allocated': '#f59e0b',
      'returned': '#6366f1',
      'damaged': '#ef4444',
      'lost': '#ef4444',
    };
    return colors[status] || '#64748b';
  };

  const getStatusBg = (status) => {
    const colors = {
      'available': 'rgba(34,197,94,0.12)',
      'allocated': 'rgba(245,158,11,0.12)',
      'returned': 'rgba(99,102,241,0.12)',
      'damaged': 'rgba(239,68,68,0.12)',
      'lost': 'rgba(239,68,68,0.12)',
    };
    return colors[status] || 'rgba(100,116,139,0.12)';
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ color: 'var(--text-secondary)', padding: 40, textAlign: 'center' }}>Loading assets...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}>
              Asset Management
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Track, assign and return company assets
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* View Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: 4,
              border: '1px solid var(--border)',
            }}>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: viewMode === 'card' ? 'var(--bg-surface)' : 'transparent',
                  color: viewMode === 'card' ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              onClick={() => navigate('/assets/add')}
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--gradient)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.target.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.target.style.filter = 'brightness(1)'}
            >
              <Plus size={18} />
              Add Asset
            </button>
          </div>
        </div>

        {msg && <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 'var(--radius-md)', background: msg.includes('success') ? 'var(--success-soft)' : 'var(--danger-soft)', color: msg.includes('success') ? 'var(--success)' : 'var(--danger)', fontSize: 14 }}>{msg}</div>}

        {assets.length === 0 ? (
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 80,
            textAlign: 'center',
            border: '1px solid var(--border)',
          }}>
            <Package size={48} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>No assets found. Add your first asset!</div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-elevated)' }}>
                <tr>
                  {['Code', 'Name', 'Type', 'Purchase Cost', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>{asset.assetCode}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{asset.assetName}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>{asset.assetType}</td>
                    <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--text-secondary)' }}>{asset.purchaseCost ? '₹' + Number(asset.purchaseCost).toLocaleString('en-IN') : '-'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 12,
                        background: getStatusBg(asset.status),
                        color: getStatusColor(asset.status),
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}>{asset.status}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate('/assets/edit/' + asset.id)} style={{ background: 'var(--accent-soft)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--accent)' }}><Eye size={15} /></button>
                        {asset.status === 'available' && <button onClick={() => openModal('allocate', asset)} style={{ background: 'var(--warning-soft)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--warning)' }}><UserCheck size={15} /></button>}
                        {asset.status === 'allocated' && <button onClick={() => openModal('return', asset)} style={{ background: 'var(--success-soft)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--success)' }}><RotateCcw size={15} /></button>}
                        <button onClick={() => handleDelete(asset.id)} style={{ background: 'var(--danger-soft)', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Card View */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {assets.map(asset => (
              <div
                key={asset.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 24,
                  border: '1px solid var(--border)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Package size={24} color="#fff" />
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    background: getStatusBg(asset.status),
                    color: getStatusColor(asset.status),
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}>{asset.status}</span>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{asset.assetName}</h3>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>{asset.assetCode}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                  <DollarSign size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {asset.purchaseCost ? '₹' + Number(asset.purchaseCost).toLocaleString('en-IN') : '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate('/assets/edit/' + asset.id)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                  {asset.status === 'available' && <button onClick={() => openModal('allocate', asset)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: 'var(--warning)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Allocate</button>}
                  {asset.status === 'allocated' && <button onClick={() => openModal('return', asset)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: 'var(--success)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Return</button>}
                  <button onClick={() => handleDelete(asset.id)} style={{ padding: '8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 32, width: 420, maxWidth: '90vw', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: 18, fontWeight: 700 }}>
                {modal.type === 'allocate' ? 'Allocate Asset' : 'Return Asset'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                Asset: <strong style={{ color: 'var(--text-primary)' }}>{modal.asset.assetName}</strong> ({modal.asset.assetCode})
              </p>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Select Employee</label>
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', cursor: 'pointer' }}>
                <option value="">-- Choose Employee --</option>
                {employees.map(emp => (
                  <option key={emp.userId || emp.id} value={emp.userId || emp.id}>{emp.name || emp.user?.name} - {emp.designation || 'N/A'}</option>
                ))}
              </select>
              {msg && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{msg}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={modal.type === 'allocate' ? handleAllocate : handleReturn} disabled={actionLoading} style={{ flex: 1, padding: '12px 0', background: modal.type === 'allocate' ? 'var(--warning)' : 'var(--success)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', opacity: actionLoading ? 0.7 : 1 }}>
                  {actionLoading ? 'Processing...' : modal.type === 'allocate' ? 'Allocate' : 'Return'}
                </button>
                <button onClick={() => setModal(null)} style={{ flex: 1, padding: '12px 0', background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Assets;
