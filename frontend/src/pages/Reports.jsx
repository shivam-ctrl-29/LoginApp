/* eslint-disable */
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, Users, CalendarDays, Package, ArrowDown } from 'lucide-react';
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
    const hdrs = Object.keys(data[0]);
    const rows = data.map(row => hdrs.map(h => row[h] ?? '').join(','));
    const csv = [hdrs.join(','), ...rows].join('\n');
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
    {
      type: 'employees', title: 'Employee Report', subtitle: 'Full employee directory with roles, departments, salary, and skills',
      icon: Users, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
    {
      type: 'leaves', title: 'Leave Report', subtitle: 'All leave applications with status, dates, and remarks',
      icon: CalendarDays, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)',
    },
    {
      type: 'assets', title: 'Asset Report', subtitle: 'Full asset inventory with allocation status and purchase details',
      icon: Package, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    },
  ];

  const FORMAT_CONFIG = {
    csv:   { label: 'CSV',   desc: 'Spreadsheet compatible', color: '#10b981' },
    excel: { label: 'Excel', desc: 'Formatted .xlsx',        color: '#3b82f6' },
    pdf:   { label: 'PDF',   desc: 'Printable report',       color: '#ef4444' },
  };

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Reports</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Export HR data in multiple formats for analysis and compliance</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
          {reports.map((r, i) => (
            <div
              key={r.type}
              style={{
                background: 'var(--gradient-card)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border)', overflow: 'hidden',
                transition: 'var(--transition)',
                animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {/* Card header accent */}
              <div style={{ height: 3, background: r.gradient }} />

              <div style={{ padding: '22px 22px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: r.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${r.color}35` }}>
                    <r.icon size={22} color="#fff" strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.subtitle}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {['csv', 'excel', 'pdf'].map(fmt => {
                    const fmtCfg = FORMAT_CONFIG[fmt];
                    const isLoading = loading === r.type + '-' + fmt;
                    return (
                      <button
                        key={fmt}
                        onClick={() => handleExport(r.type, fmt)}
                        disabled={Boolean(loading)}
                        style={{
                          flex: 1, padding: '9px 0',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${fmtCfg.color}30`,
                          background: `${fmtCfg.color}0d`,
                          color: fmtCfg.color,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          opacity: loading && !isLoading ? 0.5 : 1,
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = `${fmtCfg.color}1a`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${fmtCfg.color}0d`; }}
                      >
                        {isLoading ? (
                          <span style={{ width: 12, height: 12, border: `2px solid ${fmtCfg.color}40`, borderTopColor: fmtCfg.color, borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
                        ) : (
                          <ArrowDown size={12} />
                        )}
                        {isLoading ? '...' : fmtCfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '18px 22px', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Export Guide</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.9 }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>CSV</span> — Opens in Excel or Google Sheets. Best for data analysis and filtering. &nbsp;·&nbsp;
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>Excel</span> — Formatted .xlsx file with proper column structure. &nbsp;·&nbsp;
              <span style={{ color: '#ef4444', fontWeight: 600 }}>PDF</span> — Printable report with table formatting, ideal for sharing.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Reports;
