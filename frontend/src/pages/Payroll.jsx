// eslint-disable
// eslint-disable
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Download, FileText, TrendingDown, Calendar, CheckCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import API_URL from '../config/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Payroll() {
  const token = localStorage.getItem('token');
  const headers = { Authorization: token };
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, []); // eslint-disable-line

  const fetchPayrolls = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/payroll/my`, { headers });
      setPayrolls(res.data.payrolls || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const downloadSlip = (payroll) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('i-SOFTZONE HRMS', 14, 18);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('SALARY SLIP', 14, 30);
    doc.text(`${months[payroll.month]} ${payroll.year}`, pageWidth - 14, 30, { align: 'right' });

    // Employee Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Details', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${payroll.user?.name || 'N/A'}`, 14, 65);
    doc.text(`Email: ${payroll.user?.email || 'N/A'}`, 14, 73);
    doc.text(`Slip No: ${payroll.salarySlip?.slipNumber || 'N/A'}`, pageWidth - 14, 65, { align: 'right' });
    doc.text(`Status: ${payroll.status.toUpperCase()}`, pageWidth - 14, 73, { align: 'right' });

    // Attendance Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Attendance Summary', 14, 88);

    autoTable(doc, {
      startY: 93,
      head: [['Working Days', 'Present', 'Late', 'Absent']],
      body: [[payroll.workingDays, payroll.presentDays, payroll.lateDays, payroll.absentDays]],
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 },
    });

    // Salary Breakdown
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Salary Breakdown', 14, finalY);

    autoTable(doc, {
      startY: finalY + 5,
      head: [['Component', 'Amount (₹)']],
      body: [
        ['Gross Salary', `₹${Number(payroll.grossSalary).toLocaleString('en-IN')}`],
        ['Absent Deduction', `-₹${Number(payroll.absentDeduction).toLocaleString('en-IN')}`],
        ['Late Deduction', `-₹${Number(payroll.lateDeduction).toLocaleString('en-IN')}`],
        ['PF Deduction (12%)', `-₹${Number(payroll.pfDeduction).toLocaleString('en-IN')}`],
        ['ESIC Deduction (0.75%)', `-₹${Number(payroll.esicDeduction).toLocaleString('en-IN')}`],
        ['Total Deductions', `-₹${Number(payroll.totalDeductions).toLocaleString('en-IN')}`],
      ],
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 },
    });

    // Net Salary
    const netY = doc.lastAutoTable.finalY + 5;
    doc.setFillColor(99, 102, 241);
    doc.rect(14, netY, pageWidth - 28, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('NET SALARY (TDC)', 20, netY + 9);
    doc.text(`₹${Number(payroll.netSalary).toLocaleString('en-IN')}`, pageWidth - 20, netY + 9, { align: 'right' });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer generated salary slip. No signature required.', pageWidth / 2, 280, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 286, { align: 'center' });

    doc.save(`Salary_Slip_${months[payroll.month]}_${payroll.year}.pdf`);
  };

  return (
    <AppLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>My Payroll</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>View and download your salary slips</p>
        </div>

        {/* Payroll Cards */}
        {payrolls.length === 0 ? (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 80, textAlign: 'center' }}>
            <FileText size={48} color='var(--text-muted)' style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No payroll records yet</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Your salary slips will appear here once generated by HR</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {payrolls.map((payroll, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Card Header */}
                <div style={{ background: 'var(--gradient)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{months[payroll.month]} {payroll.year}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{payroll.salarySlip?.slipNumber || 'Pending'}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, background: payroll.status === 'paid' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                    {payroll.status}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: 'Gross Salary', value: `₹${Number(payroll.grossSalary).toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
                      { label: 'Net Salary (TDC)', value: `₹${Number(payroll.netSalary).toLocaleString('en-IN')}`, color: 'var(--success)' },
                      { label: 'Total Deductions', value: `₹${Number(payroll.totalDeductions).toLocaleString('en-IN')}`, color: 'var(--danger)' },
                      { label: 'PF Deduction', value: `₹${Number(payroll.pfDeduction).toLocaleString('en-IN')}`, color: 'var(--warning)' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Attendance Row */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'P', value: payroll.presentDays, color: 'var(--success)', bg: 'var(--success-soft)' },
                      { label: 'L', value: payroll.lateDays, color: 'var(--warning)', bg: 'var(--warning-soft)' },
                      { label: 'A', value: payroll.absentDays, color: 'var(--danger)', bg: 'var(--danger-soft)' },
                    ].map((item, i) => (
                      <div key={i} style={{ flex: 1, background: item.bg, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: 10, color: item.color, fontWeight: 600 }}>{item.label === 'P' ? 'Present' : item.label === 'L' ? 'Late' : 'Absent'}</div>
                      </div>
                    ))}
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => downloadSlip(payroll)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'var(--gradient)',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontFamily: 'inherit',
                    }}
                  >
                    <Download size={16} />
                    Download Salary Slip PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Payroll;
