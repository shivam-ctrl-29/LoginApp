/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Download, TrendingDown, Calendar, CheckCircle, X } from 'lucide-react';
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
  const fmt = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');

  const downloadSlip = (payroll) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
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
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Salary Breakdown', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Component', 'Amount (₹)']],
      body: [
        ['Gross Salary', `₹${fmt(payroll.grossSalary)}`],
        ['Absent Deduction', `-₹${fmt(payroll.absentDeduction)}`],
        ['Late Deduction', `-₹${fmt(payroll.lateDeduction)}`],
        ['PF Deduction (12%)', `-₹${fmt(payroll.pfDeduction)}`],
        ['ESIC Deduction (0.75%)', `-₹${fmt(payroll.esicDeduction)}`],
        ['Total Deductions', `-₹${fmt(payroll.totalDeductions)}`],
      ],
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 10 },
    });
    const y2 = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(99, 102, 241);
    doc.rect(14, y2, pageWidth - 28, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('NET SALARY (TDC)', 18, y2 + 8);
    doc.text(`₹${fmt(payroll.netSalary)}`, pageWidth - 18, y2 + 8, { align: 'right' });
    doc.save(`Salary_Slip_${months[payroll.month]}_${payroll.year}.pdf`);
  };

  const MONTH_GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #f97316)',
    'linear-gradient(135deg, #3b82f6, #6366f1)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #14b8a6, #3b82f6)',
  ];

  return (
    <AppLayout>
      <div style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>My Payroll</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{payrolls.length} salary slip{payrolls.length !== 1 ? 's' : ''} available</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading payroll...</div>
        ) : payrolls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <DollarSign size={40} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>No payroll records yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {payrolls.map((p, i) => (
              <div
                key={p.id}
                style={{
                  background: 'var(--gradient-card)', borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)', overflow: 'hidden',
                  transition: 'var(--transition)',
                  animation: `fadeInUp 0.3s ease ${i * 0.06}s both`,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
                onClick={() => setSelected(p)}
              >
                {/* Card header */}
                <div style={{ background: MONTH_GRADIENTS[i % MONTH_GRADIENTS.length], padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -30, right: -20, pointerEvents: 'none' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', marginBottom: 4 }}>{p.year}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{months[p.month]}</div>
                  <div style={{ marginTop: 8, display: 'inline-flex', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {p.status}
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>Net Salary</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                        ₹{fmt(p.netSalary)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>Deductions</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', fontFamily: 'monospace' }}>
                        -₹{fmt(p.totalDeductions)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                    <span>{p.presentDays || 0}P</span>
                    <span>·</span>
                    <span>{p.lateDays || 0}L</span>
                    <span>·</span>
                    <span>{p.absentDays || 0}A</span>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); downloadSlip(p); }}
                    style={{ width: '100%', padding: '9px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  >
                    <Download size={13} /> Download Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, top: 56, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 950, backdropFilter: 'blur(6px)' }}>
            <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-2xl)', padding: 0, maxWidth: 440, width: '90%', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', animation: 'modalEnter 0.25s ease', overflow: 'hidden' }}>
              <div style={{ background: 'var(--gradient)', padding: '22px 26px', position: 'relative' }}>
                <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <X size={14} />
                </button>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.1em' }}>{selected.year}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{months[selected.month]} Salary Slip</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>₹{fmt(selected.netSalary)}</div>
              </div>
              <div style={{ padding: '20px 26px' }}>
                {[
                  ['Gross Salary', `₹${fmt(selected.grossSalary)}`, ''],
                  ['Absent Deduction', `-₹${fmt(selected.absentDeduction)}`, 'var(--danger)'],
                  ['Late Deduction', `-₹${fmt(selected.lateDeduction)}`, 'var(--danger)'],
                  ['PF (12%)', `-₹${fmt(selected.pfDeduction)}`, 'var(--danger)'],
                  ['ESIC (0.75%)', `-₹${fmt(selected.esicDeduction)}`, 'var(--danger)'],
                  ['Total Deductions', `-₹${fmt(selected.totalDeductions)}`, 'var(--danger)'],
                ].map(([label, value, color], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--text-primary)', fontFamily: 'monospace' }}>{value}</span>
                  </div>
                ))}
                <button onClick={() => downloadSlip(selected)} style={{ width: '100%', marginTop: 16, padding: '11px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: 'var(--shadow-accent)' }}>
                  <Download size={15} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Payroll;
