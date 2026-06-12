/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, Plus, UserCheck, RotateCcw, Trash2, LayoutGrid, List, Pencil, Monitor, Keyboard, Mouse, Smartphone, CreditCard, Headphones } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';

const STATUS_CONFIG = {
  available: { color: 'var(--success)', bg: 'var(--success-soft)', label: 'Available' },
  allocated: { color: 'var(--warning)', bg: 'var(--warning-soft)', label: 'Allocated' },
  returned:  { color: 'var(--accent)',  bg: 'var(--accent-soft)',  label: 'Returned' },
  damaged:   { color: 'var(--danger)',  bg: 'var(--danger-soft)',  label: 'Damaged' },
  lost:      { color: '#64748b',        bg: 'rgba(100,116,139,0.1)', label: 'Lost' },
};

const ASSET_ICONS = { Laptop: Monitor, Monitor, Keyboard, Mouse, Mobile: Smartphone, 'ID Card': CreditCard, Headset: Headphones };

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
  const [hoveredRow, setHoveredRow] = useState(null);
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

  const getAssetIcon = (type) => ASSET_ICONS[type] || Package;

  const available = assets.filter(a => a.status === 'available').length;
  const allocated = assets.filter(a => a.status === 'allocated').length;

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Assets</h1>
              <div style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>{assets.length}</div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{available} available · {allocated} allocated</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              {[{ mode: 'table', Icon: List }, { mode: 'grid', Icon: LayoutGrid }].map(({ mode, Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '8px 12px', border: 'none', background: viewMode === mode ? 'var(--accent-soft)' : 'transparent', color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', transition: 'var(--transition)' }}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/assets/add')} style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: 'var(--shadow-accent)', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
            >
              <Plus size={15} /> Add Asset
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {['Asset', 'Type', 'Status', 'Assigned To', 'Actions'].map((h, i) => (
                    <th key={i} style={{ padding: '13px 20px', textAlign: i === 4 ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const st = STATUS_CONFIG[asset.status] || STATUS_CONFIG.available;
                  const AssetIcon = getAssetIcon(asset.assetType);
                  return (
                    <tr key={asset.id} onMouseEnter={() => setHoveredRow(asset.id)} onMouseLeave={() => setHoveredRow(null)}
                      style={{ borderBottom: '1px solid var(--border)', height: 60, background: hoveredRow === asset.id ? 'var(--bg-hover)' : 'transparent', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AssetIcon size={16} color="var(--accent)" />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{asset.assetName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{asset.assetCode}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{asset.assetType}</td>
                      <td style={{ padding: '0 20px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: st.bg, color: st.color, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {asset.allocations?.length > 0 ? asset.allocations.map(a => a.user?.name).join(', ') : '—'}
                      </td>
                      <td style={{ padding: '0 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => navigate('/assets/edit/' + asset.id)} style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                          ><Pencil size={12} /> Edit</button>
                          {asset.status === 'available' && (
                            <button onClick={() => openModal('allocate', asset)} style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)' }}>
                              <UserCheck size={12} /> Allocate
                            </button>
                          )}
                          {asset.status === 'allocated' && (
                            <button onClick={() => openModal('return', asset)} style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--warning-soft)', color: 'var(--warning)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)' }}>
                              <RotateCcw size={12} /> Return
                            </button>
                          )}
                          <button onClick={() => handleDelete(asset.id)} style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)' }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {assets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
                <Package size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <div>No assets found. Add your first asset!</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {assets.map((asset, i) => {
              const st = STATUS_CONFIG[asset.status] || STATUS_CONFIG.available;
              const AssetIcon = getAssetIcon(asset.assetType);
              return (
                <div key={asset.id} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 18, transition: 'var(--transition)', animation: `fadeInUp 0.3s ease ${i * 0.04}s both`, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AssetIcon size={20} color="var(--accent)" />
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', background: st.bg, color: st.color, fontSize: 10, fontWeight: 700 }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{asset.assetName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{asset.assetCode} · {asset.assetType}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate('/assets/edit/' + asset.id)} style={{ flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', transition: 'var(--transition)' }}>Edit</button>
                    {asset.status === 'available' && <button onClick={() => openModal('allocate', asset)} style={{ flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Allocate</button>}
                    {asset.status === 'allocated' && <button onClick={() => openModal('return', asset)} style={{ flex: 1, padding: '6px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--warning-soft)', color: 'var(--warning)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Return</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <div style={{ position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 950, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 380, width: '90%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', animation: 'modalEnter 0.25s ease' }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {modal.type === 'allocate' ? 'Allocate Asset' : 'Return Asset'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {modal.asset.assetName} — {modal.asset.assetCode}
              </p>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                {modal.type === 'allocate' ? 'Select Employee' : 'Select Employee to Return From'}
              </label>
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', marginBottom: 16 }}>
                <option value="">Choose employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              {msg && <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: msg.includes('Error') || msg.includes('Please') ? 'var(--danger-soft)' : 'var(--success-soft)', color: msg.includes('Error') || msg.includes('Please') ? 'var(--danger)' : 'var(--success)', fontSize: 12, marginBottom: 16 }}>{msg}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(null)} style={{ padding: '9px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer', transition: 'var(--transition)' }}>Cancel</button>
                <button onClick={modal.type === 'allocate' ? handleAllocate : handleReturn} disabled={actionLoading}
                  style={{ padding: '9px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: actionLoading ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow-accent)' }}>
                  {actionLoading ? 'Processing...' : (modal.type === 'allocate' ? 'Allocate' : 'Return')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Assets;
