/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Play, CheckCircle, Users, DollarSign, FileText, ArrowDown } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';

function PayrollAdmin() {
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [hoveredRow, setHoveredRow] = useState(null);

  const months = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

  useEffect(() => { fetchPayrolls(); }, [month, year]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/payroll/report?month=${month}&year=${year}`, { headers });
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAll = async () => {
    setGenerating(true);
    try {
      await axios.post(`${API_URL}/api/v1/payroll/generate-all`, { month, year }, { headers });
      alert(`Payroll generated for ${months[month]} ${year}!`);
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setGenerating(false);
    }
  };

  const markPaid = async (userId) => {
    try {
      await axios.post(`${API_URL}/api/v1/payroll/mark-paid`, { userId, month, year }, { headers });
      fetchPayrolls();
    } catch (err) {
      alert('Failed to mark as paid');
    }
  };

  const getExportData = () => payrolls.map((p, i) => ({
    '#': i + 1,
    'Employee': p.user?.name || '',
    'Email': p.user?.email || '',
    'Gross Salary': p.grossSalary,
    'Present Days': p.presentDays,
    'Late Days': p.lateDays,
    'Absent Days': p.absentDays,
    'Absent Deduction': Number(p.absentDeduction).toFixed(2),
    'Late Deduction': Number(p.lateDeduction).toFixed(2),
    'PF Deduction': Number(p.pfDeduction).toFixed(2),
    'ESIC Deduction': Number(p.esicDeduction).toFixed(2),
    'Total Deductions': Number(p.totalDeductions).toFixed(2),
    'Net Salary (TDC)': Number(p.netSalary).toFixed(2),
    'Status': p.status.toUpperCase(),
  }));

  const exportCSV = () => {
    if (!payrolls.length) return alert('No payroll data');
    const data = getExportData();
    const hdrs = Object.keys(data[0]);
    const rows = data.map(row => hdrs.map(h => row[h]).join(','));
    const csv = [hdrs.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Salary_Sheet_${months[month]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (!payrolls.length) return alert('No payroll data');
    const data = getExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Salary Sheet');
    XLSX.writeFile(wb, `Salary_Sheet_${months[month]}_${year}.xlsx`);
  };

  const exportPDF = () => {
    if (!payrolls.length) return alert('No payroll data');
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('i-SOFTZONE HRMS — Salary Sheet', 14, 12);
    doc.setFontSize(11);
    doc.text(`${months[month]} ${year}`, 14, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 22, { align: 'right' });
    const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
    autoTable(doc, {
      startY: 38,
      head: [['#', 'Employee', 'Email', 'Gross', 'P', 'L', 'A', 'Abs.Ded', 'Late Ded', 'PF', 'ESIC', 'Tot.Ded', 'Net (TDC)', 'Status']],
      body: [
        ...payrolls.map((p, i) => [
          i + 1, p.user?.name || '', p.user?.email || '',
          Number(p.grossSalary).toLocaleString('en-IN'),
          p.presentDays, p.lateDays, p.absentDays,
          `${Number(p.absentDeduction).toFixed(0)}`, `${Number(p.lateDeduction).toFixed(0)}`,
          `${Number(p.pfDeduction).toFixed(0)}`, `${Number(p.esicDeduction).toFixed(0)}`,
          `${Number(p.totalDeductions).toFixed(0)}`, `${Number(p.netSalary).toLocaleString('en-IN')}`,
          p.status.toUpperCase(),
        ]),
        ['', '', 'TOTAL', Number(totalGross).toLocaleString('en-IN'), '', '', '', '', '', '', '', Number(totalDeductions).toFixed(0), Number(totalNet).toLocaleString('en-IN'), ''],
      ],
      headStyles: { fillColor: [99, 102, 241], fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2 },
      bodyStyles: { textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 28 }, 2: { cellWidth: 40 }, 3: { cellWidth: 20 }, 4: { cellWidth: 8 }, 5: { cellWidth: 8 }, 6: { cellWidth: 8 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 }, 9: { cellWidth: 18 }, 10: { cellWidth: 14 }, 11: { cellWidth: 18 }, 12: { cellWidth: 22 }, 13: { cellWidth: 18 } },
    });
    doc.save(`Salary_Sheet_${months[month]}_${year}.pdf`);
  };

  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const paidCount = payrolls.filter(p => p.status === 'paid').length;

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>Payroll Management</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Generate and manage employee salaries — {months[month]} {year}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ height: 38, padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
              {months.slice(1).map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ height: 38, padding: '0 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={generateAll} disabled={generating} style={{ padding: '9px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: 'var(--shadow-accent)', transition: 'var(--transition)' }}
              onMouseEnter={e => { if (!generating) e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              {generating ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} /> : <Play size={14} />}
              {generating ? 'Generating...' : 'Generate All'}
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Employees', value: payrolls.length, color: '#6366f1', icon: Users },
            { label: 'Total Gross', value: `₹${Number(totalGross).toLocaleString('en-IN')}`, color: '#f59e0b', icon: DollarSign },
            { label: 'Net Payable', value: `₹${Number(totalNet).toLocaleString('en-IN')}`, color: '#10b981', icon: CheckCircle },
            { label: 'Paid', value: `${paidCount}/${payrolls.length}`, color: '#3b82f6', icon: FileText },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} style={{ background: 'var(--gradient-card)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Icon size={15} color={card.color} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: card.label !== 'Employees' && card.label !== 'Paid' ? 'monospace' : 'inherit', letterSpacing: '-0.01em' }}>{card.value}</div>
              </div>
            );
          })}
        </div>

        {/* Export buttons */}
        {payrolls.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'CSV', color: '#10b981', fn: exportCSV },
              { label: 'Excel', color: '#3b82f6', fn: exportExcel },
              { label: 'PDF', color: '#ef4444', fn: exportPDF },
            ].map(btn => (
              <button key={btn.label} onClick={btn.fn} style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${btn.color}30`, background: `${btn.color}0d`, color: btn.color, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = `${btn.color}1a`}
                onMouseLeave={e => e.currentTarget.style.background = `${btn.color}0d`}
              >
                <ArrowDown size={12} /> {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Employee', 'Gross', 'Attendance', 'Deductions', 'Net (TDC)', 'Status', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '13px 18px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading...</td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No payroll data for {months[month]} {year}. Click "Generate All" to create.</td></tr>
              ) : payrolls.map((p, i) => (
                <tr key={p.id || i} onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}
                  style={{ borderBottom: '1px solid var(--border)', height: 58, background: hoveredRow === i ? 'var(--bg-hover)' : 'transparent', transition: 'background 0.15s' }}>
                  <td style={{ padding: '0 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {p.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.user?.name || 'N/A'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.user?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0 18px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>₹{Number(p.grossSalary || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0 18px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{p.presentDays}P</span>
                      {' · '}
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{p.lateDays}L</span>
                      {' · '}
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{p.absentDays}A</span>
                    </div>
                  </td>
                  <td style={{ padding: '0 18px', fontSize: 13, color: 'var(--danger)', fontFamily: 'monospace', fontWeight: 600 }}>-₹{Number(p.totalDeductions || 0).toFixed(0)}</td>
                  <td style={{ padding: '0 18px', fontSize: 14, fontWeight: 800, color: 'var(--success)', fontFamily: 'monospace' }}>₹{Number(p.netSalary || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0 18px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: p.status === 'paid' ? 'var(--success-soft)' : 'var(--warning-soft)', color: p.status === 'paid' ? 'var(--success)' : 'var(--warning)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '0 18px' }}>
                    {p.status !== 'paid' && (
                      <button onClick={() => markPaid(p.userId)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--success-soft)', color: 'var(--success)', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'var(--transition)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--success-glow)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--success-soft)'}
                      >
                        <CheckCircle size={12} /> Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default PayrollAdmin;
