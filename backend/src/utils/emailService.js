const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'i-SOFTZONE HRMS <onboarding@resend.dev>';

const baseStyle = `font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;`;
const h2Style = `color:#1e293b;font-size:22px;margin:0 0 8px;`;
const pStyle = `color:#475569;font-size:15px;line-height:1.6;margin:0 0 16px;`;
const labelStyle = `padding:10px 12px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;background:#f8fafc;`;
const valueStyle = `padding:10px 12px;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;`;
const footerStyle = `color:#94a3b8;font-size:12px;margin-top:24px;`;

const sendWelcomeEmail = async ({ name, email, password }) => {
  try {
    await resend.emails.send({
      from: FROM, to: email,
      subject: 'Welcome to i-SOFTZONE HRMS!',
      html: `<div style="${baseStyle}">
        <h2 style="${h2Style}">Welcome, ${name}! 👋</h2>
        <p style="${pStyle}">Your i-SOFTZONE HRMS account has been created successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="${labelStyle}">Email</td><td style="${valueStyle}">${email}</td></tr>
          <tr><td style="${labelStyle}">Password</td><td style="${valueStyle}">${password}</td></tr>
        </table>
        <p style="color:#ef4444;font-size:13px;">Please login and change your password immediately.</p>
        <p style="${footerStyle}">— i-SOFTZONE HR Team</p>
      </div>`,
    });
    console.log(`[EMAIL] Welcome email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Welcome email failed:', err.message);
  }
};

const sendLeaveStatusEmail = async ({ name, email, status, leaveType, startDate, endDate, comments }) => {
  const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
  const statusBg   = status === 'approved' ? '#f0fdf4' : '#fef2f2';
  try {
    await resend.emails.send({
      from: FROM, to: email,
      subject: `Leave ${status.charAt(0).toUpperCase() + status.slice(1)} — i-SOFTZONE HRMS`,
      html: `<div style="${baseStyle}">
        <h2 style="${h2Style}">Leave Request Update</h2>
        <p style="${pStyle}">Dear <b>${name}</b>, your leave request has been:</p>
        <div style="display:inline-block;background:${statusBg};color:${statusColor};padding:6px 16px;border-radius:20px;font-weight:700;font-size:15px;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.05em;">
          ${status}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="${labelStyle}">Leave Type</td><td style="${valueStyle}">${leaveType}</td></tr>
          <tr><td style="${labelStyle}">From</td><td style="${valueStyle}">${new Date(startDate).toDateString()}</td></tr>
          <tr><td style="${labelStyle}">To</td><td style="${valueStyle}">${new Date(endDate).toDateString()}</td></tr>
          ${comments ? `<tr><td style="${labelStyle}">Comments</td><td style="${valueStyle}">${comments}</td></tr>` : ''}
        </table>
        <p style="${footerStyle}">— i-SOFTZONE HR Team</p>
      </div>`,
    });
    console.log(`[EMAIL] Leave status email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Leave status email failed:', err.message);
    throw err;
  }
};

const sendAssetAssignedEmail = async ({ name, email, assetName, assetCode, assetType }) => {
  try {
    await resend.emails.send({
      from: FROM, to: email,
      subject: 'Asset Assigned to You — i-SOFTZONE HRMS',
      html: `<div style="${baseStyle}">
        <h2 style="${h2Style}">Asset Assigned</h2>
        <p style="${pStyle}">Dear <b>${name}</b>, an asset has been assigned to you.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="${labelStyle}">Asset Name</td><td style="${valueStyle}">${assetName}</td></tr>
          <tr><td style="${labelStyle}">Asset Code</td><td style="${valueStyle}">${assetCode}</td></tr>
          <tr><td style="${labelStyle}">Asset Type</td><td style="${valueStyle}">${assetType}</td></tr>
        </table>
        <p style="${footerStyle}">— i-SOFTZONE HR Team</p>
      </div>`,
    });
    console.log(`[EMAIL] Asset assigned email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Asset assigned email failed:', err.message);
  }
};

const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    await resend.emails.send({
      from: FROM, to: email,
      subject: 'Reset Your Password — i-SOFTZONE HRMS',
      html: `<div style="${baseStyle}">
        <h2 style="${h2Style}">Password Reset Request</h2>
        <p style="${pStyle}">Click the button below to reset your password. This link expires in <b>15 minutes</b>.</p>
        <a href="${resetLink}" style="display:inline-block;background:#6366f1;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;margin-bottom:20px;">Reset Password</a>
        <p style="${pStyle}">Or copy this link:<br/><span style="color:#6366f1;font-size:13px;word-break:break-all;">${resetLink}</span></p>
        <p style="${footerStyle}">If you didn't request this, you can safely ignore this email. — i-SOFTZONE HR Team</p>
      </div>`,
    });
    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Password reset email failed:', err.message);
    throw err;
  }
};

module.exports = { sendWelcomeEmail, sendLeaveStatusEmail, sendAssetAssignedEmail, sendPasswordResetEmail };
