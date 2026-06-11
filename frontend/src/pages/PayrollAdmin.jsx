// eslint-disable
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Play, CheckCircle, Users, DollarSign, FileText } from 'lucide-react';
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
          i + 1,
          p.user?.name || '',
          p.user?.email || '',
          Number(p.grossSalary).toLocaleString('en-IN'),
          p.presentDays, p.lateDays, p.absentDays,
          `${Number(p.absentDeduction).toFixed(0)}`,
          `${Number(p.lateDeduction).toFixed(0)}`,
          `${Number(p.pfDeduction).toFixed(0)}`,
          `${Number(p.esicDeduction).toFixed(0)}`,
          `${Number(p.totalDeductions).toFixed(0)}`,
          `${Number(p.netSalary).toLocaleString('en-IN')}`,
          p.status.toUpperCase(),
        ]),
        ['', '', 'TOTAL', Number(totalGross).toLocaleString('en-IN'), '', '', '', '', '', '', '', Number(totalDeductions).toFixed(0), Number(totalNet).toLocaleString('en-IN'), ''],
      ],
      headStyles: { fillColor: [99, 102, 241], fontSize: 7, halign: 'center' },
      styles: { fontSize: 7, cellPadding: 2 },
      bodyStyles: { textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [245, 245, 255] },
      columnStyles: {
        0: { cellWidth: 8 }, 1: { cellWidth: 28 }, 2: { cellWidth: 40 },
        3: { cellWidth: 20 }, 4: { cellWidth: 8 }, 5: { cellWidth: 8 },
        6: { cellWidth: 8 }, 7: { cellWidth: 18 }, 8: { cellWidth: 18 },
        9: { cellWidth: 18 }, 10: { cellWidth: 14 }, 11: { cellWidth: 18 },
        12: { cellWidth: 22 }, 13: { cellWidth: 18 },
      },
    });

    doc.save(`Salary_Sheet_${months[month]}_${year}.pdf`);
  };

  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);

  return (
    <AppLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Payroll Management</h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Generate and manage employee salaries</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
              {months.slice(1).map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))}
              style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}>
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={generateAll} disabled={generating}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              <Play size={15} />
              {generating ? 'Generating...' : 'Generate All'}
            </button>
            <button onClick={exportCSV}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)', background: 'var(--success-soft)', color: 'var(--success)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              <Download size={15} /> CSV
            </button>
            <button onClick={exportExcel}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              <Download size={15} /> Excel
            </button>
            <button onClick={exportPDF}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
              <Download size={15} /> PDF
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Employees', value: payrolls.length, icon: Users, color: 'var(--accent)', bg: 'var(--accent-soft)' },
            { label: 'Total Gross Salary', value: `₹${Number(totalGross).toLocaleString('en-IN')}`, icon: DollarSign, color: 'var(--success)', bg: 'var(--success-soft)' },
            { label: 'Total Net Payout', value: `₹${Number(totalNet).toLocaleString('en-IN')}`, icon: FileText, color: 'var(--warning)', bg: 'var(--warning-soft)' },
          ].map((card, idx) => (
            <div key={idx} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={20} color={card.color} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{card.label}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Employee', 'Gross', 'P/L/A', 'Deductions', 'PF', 'ESIC', 'Net Salary (TDC)', 'Status', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                    No payroll generated yet. Click "Generate All" to start.
                  </td>
                </tr>
              ) : (
                payrolls.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{p.user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.user?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace' }}>₹{Number(p.grossSalary).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--success-soft)', color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>{p.presentDays}P</span>
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--warning-soft)', color: 'var(--warning)', fontSize: 11, fontWeight: 600 }}>{p.lateDays}L</span>
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: 11, fontWeight: 600 }}>{p.absentDays}A</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--danger)', fontFamily: 'monospace' }}>-₹{Number(p.totalDeductions).toFixed(0)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>₹{Number(p.pfDeduction).toFixed(0)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>₹{Number(p.esicDeduction).toFixed(0)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--success)', fontFamily: 'monospace' }}>₹{Number(p.netSalary).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, background: p.status === 'paid' ? 'var(--success-soft)' : 'var(--warning-soft)', color: p.status === 'paid' ? 'var(--success)' : 'var(--warning)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {p.status !== 'paid' && (
                        <button onClick={() => markPaid(p.userId)}
                          style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--success-soft)', color: 'var(--success)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                          <CheckCircle size={14} />
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default PayrollAdmin;
