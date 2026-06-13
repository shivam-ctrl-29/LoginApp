const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Send Welcome Email ───────────────────────────────────────
const sendWelcomeEmail = async ({ name, email, password }) => {
  try {
    await transporter.sendMail({
      from: `"HR Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to the Team!',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
        <p>Please login and change your password immediately.</p>
        <br/>
        <p>Regards,<br/>HR Team</p>
      `
    });
    console.log(`[EMAIL] Welcome email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Welcome email failed:', err.message);
  }
};

// ─── Send Leave Status Email ──────────────────────────────────
const sendLeaveStatusEmail = async ({ name, email, status, leaveType, startDate, endDate, comments }) => {
  const statusColor = status === 'approved' ? 'green' : 'red';
  try {
    await transporter.sendMail({
      from: `"HR Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <h2>Leave Request Update</h2>
        <p>Dear ${name},</p>
        <p>Your leave request has been <b style="color:${statusColor}">${status}</b>.</p>
        <table border="1" cellpadding="8" style="border-collapse:collapse;">
          <tr><td><b>Leave Type</b></td><td>${leaveType}</td></tr>
          <tr><td><b>From</b></td><td>${new Date(startDate).toDateString()}</td></tr>
          <tr><td><b>To</b></td><td>${new Date(endDate).toDateString()}</td></tr>
          ${comments ? `<tr><td><b>Comments</b></td><td>${comments}</td></tr>` : ''}
        </table>
        <br/>
        <p>Regards,<br/>HR Team</p>
      `
    });
    console.log(`[EMAIL] Leave status email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Leave status email failed:', err.message);
  }
};

// ─── Send Asset Assigned Email ────────────────────────────────
const sendAssetAssignedEmail = async ({ name, email, assetName, assetCode, assetType }) => {
  try {
    await transporter.sendMail({
      from: `"HR Management" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Asset Assigned to You',
      html: `
        <h2>Asset Assignment Notice</h2>
        <p>Dear ${name},</p>
        <p>An asset has been assigned to you.</p>
        <table border="1" cellpadding="8" style="border-collapse:collapse;">
          <tr><td><b>Asset Name</b></td><td>${assetName}</td></tr>
          <tr><td><b>Asset Code</b></td><td>${assetCode}</td></tr>
          <tr><td><b>Asset Type</b></td><td>${assetType}</td></tr>
        </table>
        <br/>
        <p>Please take care of the assigned asset.</p>
        <p>Regards,<br/>HR Team</p>
      `
    });
    console.log(`[EMAIL] Asset assigned email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Asset assigned email failed:', err.message);
  }
};

// ─── Send Password Reset Email ────────────────────────────────
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    await transporter.sendMail({
      from: `"i-SOFTZONE HRMS" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f1a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="color:#f8fafc;font-size:22px;margin-bottom:8px;">Password Reset</h2>
          <p style="color:#94a3b8;margin-bottom:24px;">Click the button below to reset your password. This link expires in <b style="color:#f8fafc;">15 minutes</b>.</p>
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Reset Password</a>
          <p style="color:#475569;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Password reset email failed:', err.message);
    throw err;
  }
};

module.exports = { sendWelcomeEmail, sendLeaveStatusEmail, sendAssetAssignedEmail, sendPasswordResetEmail };
