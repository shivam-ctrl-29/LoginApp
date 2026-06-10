import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, Users, CalendarDays, Package } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';

function Reports() {
  const [loading, setLoading] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  const fetchEmployees = async () => {
    const res = await axios.get(API_URL + '/api/v1/employees?limit=1000', { headers });
    const data = res.data;
    const list = Array.isArray(data) ? data : (data.employees || []);
    return list.map(e => ({
      Name: e.name || '',
      Email: e.email || '',
      Role: e.role || '',
      Department: e.department_name || '',
      Designation: e.designation || '',
      Phone: e.phone || '',
      Salary: e.salary || '',
      Skills: (e.skills || []).join(', '),
    }));
  };

  const fetchLeaves = async () => {
    const res = await axios.get(API_URL + '/api/v1/leave/all', { headers });
    const list = Array.isArray(res.data) ? res.data : (res.data?.leaves || []);
    return list.map(l => ({
      Employee: l.employee_name || '',
      Type: l.leave_name || '',
      From: l.from_date ? new Date(l.from_date).toLocaleDateString() : '',
      To: l.to_date ? new Date(l.to_date).toLocaleDateString() : '',
      Days: l.days || '',
      Status: l.status || '',
      Reason: l.reason || '',
    }));
  };

  const fetchAssets = async () => {
    const res = await axios.get(API_URL + '/api/v1/assets?limit=1000', { headers });
    const list = Array.isArray(res.data) ? res.data : (res.data?.assets || []);
    return list.map(a => ({
      Code: a.assetCode || '',
      Name: a.assetName || '',
      Type: a.assetType || '',
      Status: a.status || '',
      'Purchase Date': a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '',
      'Purchase Cost': a.purchaseCost || '',
    }));
  };

  const exportCSV = (data, filename) => {
    if (!data.length) return alert('No data to export');
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename + '.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = (data, filename) => {
    if (!data.length) return alert('No data to export');
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    XLSX.writeFile(wb, filename + '.xlsx');
  };

  const exportPDF = (data, filename, title) => {
    if (!data.length) return alert('No data to export');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text('Generated: ' + new Date().toLocaleString(), 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [Object.keys(data[0])],
      body: data.map(row => Object.values(row).map(v => String(v ?? ''))),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241] },
    });
    doc.save(filename + '.pdf');
  };

  const handleExport = async (type, format) => {
    const key = type + '-' + format;
    setLoading(key);
    try {
      let data = [];
      let filename = '';
      let title = '';
      if (type === 'employees') { data = await fetchEmployees(); filename = 'Employee_Report'; title = 'Employee Report'; }
      else if (type === 'leaves') { data = await fetchLeaves(); filename = 'Leave_Report'; title = 'Leave Report'; }
      else if (type === 'assets') { data = await fetchAssets(); filename = 'Asset_Report'; title = 'Asset Report'; }

      if (format === 'csv') exportCSV(data, filename);
      else if (format === 'excel') exportExcel(data, filename);
      else if (format === 'pdf') exportPDF(data, filename, title);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(''); }
  };

  const reports = [
    { type: 'employees', title: 'Employee Report', subtitle: 'Name, email, department, skills, salary', icon: Users, color: '#6366f1' },
    { type: 'leaves', title: 'Leave Report', subtitle: 'All leave requests with status', icon: CalendarDays, color: '#22c55e' },
    { type: 'assets', title: 'Asset Report', subtitle: 'All assets with status and cost', icon: Package, color: '#f59e0b' },
  ];

  return (
    <AppLayout>
      <div style={{ animation: 'authCardEnter 0.4s ease forwards' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Reports
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Export data as PDF, Excel or CSV
          </p>
        </div>

        {/* Report Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {reports.map(r => (
            <div
              key={r.type}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: r.color + '22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <r.icon size={22} color={r.color} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{r.subtitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {['csv', 'excel', 'pdf'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => handleExport(r.type, fmt)}
                    disabled={loading === r.type + '-' + fmt}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      background: loading === r.type + '-' + fmt ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      cursor: loading === r.type + '-' + fmt ? 'not-allowed' : 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      textTransform: 'uppercase',
                      fontFamily: 'inherit',
                      opacity: loading === r.type + '-' + fmt ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => loading !== r.type + '-' + fmt && (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  >
                    <Download size={13} />
                    {loading === r.type + '-' + fmt ? '...' : fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions Card */}
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid var(--border)',
          marginTop: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <FileText size={18} color="var(--accent)" />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Export Instructions</div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            • <strong>CSV</strong> — Opens in Excel, Google Sheets. Best for data analysis.<br />
            • <strong>Excel</strong> — Formatted .xlsx file with proper columns.<br />
            • <strong>PDF</strong> — Printable report with table formatting.
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Reports;
