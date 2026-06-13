const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'i-SOFTZONE HRMS <onboarding@resend.dev>';

const sendWelcomeEmail = async ({ name, email, password }) => {
  try {
    await resend.emails.send({
      from: FROM, to: email,
      subject: 'Welcome to i-SOFTZONE HRMS!',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f1a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="color:#f8fafc;font-size:22px;margin-bottom:8px;">Welcome, ${name}!</h2>
          <p style="color:#94a3b8;margin-bottom:16px;">Your account has been created successfully.</p>
          <p style="color:#94a3b8;"><b style="color:#f8fafc;">Email:</b> ${email}</p>
          <p style="color:#94a3b8;"><b style="color:#f8fafc;">Password:</b> ${password}</p>
          <p style="color:#475569;font-size:12px;margin-top:24px;">Please login and change your password immediately.</p>
        </div>`,
    });
    console.log(`[EMAIL] Welcome email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Welcome email failed:', err.message);
  }
};

const sendLeaveStatusEmail = async ({ name, email, status, leaveType, startDate, endDate, comments }) => {
  const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
  try {
    await resend.emails.send({
      from: FROM, to: email,
      subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f1a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="color:#f8fafc;font-size:22px;margin-bottom:8px;">Leave Request Update</h2>
          <p style="color:#94a3b8;margin-bottom:16px;">Dear ${name}, your leave request has been <b style="color:${statusColor}">${status}</b>.</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <tr><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.06);">Leave Type</td><td style="padding:8px;color:#f8fafc;border-bottom:1px solid rgba(255,255,255,0.06);">${leaveType}</td></tr>
            <tr><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.06);">From</td><td style="padding:8px;color:#f8fafc;border-bottom:1px solid rgba(255,255,255,0.06);">${new Date(startDate).toDateString()}</td></tr>
            <tr><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.06);">To</td><td style="padding:8px;color:#f8fafc;">${new Date(endDate).toDateString()}</td></tr>
            ${comments ? `<tr><td style="padding:8px;color:#94a3b8;">Comments</td><td style="padding:8px;color:#f8fafc;">${comments}</td></tr>` : ''}
          </table>
          <p style="color:#475569;font-size:12px;">Regards, HR Team</p>
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
      subject: 'Asset Assigned to You',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f1a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="color:#f8fafc;font-size:22px;margin-bottom:8px;">Asset Assignment</h2>
          <p style="color:#94a3b8;margin-bottom:16px;">Dear ${name}, an asset has been assigned to you.</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.06);">Asset Name</td><td style="padding:8px;color:#f8fafc;">${assetName}</td></tr>
            <tr><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.06);">Asset Code</td><td style="padding:8px;color:#f8fafc;">${assetCode}</td></tr>
            <tr><td style="padding:8px;color:#94a3b8;">Asset Type</td><td style="padding:8px;color:#f8fafc;">${assetType}</td></tr>
          </table>
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
      subject: 'Password Reset Request',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f1a;border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
          <h2 style="color:#f8fafc;font-size:22px;margin-bottom:8px;">Password Reset</h2>
          <p style="color:#94a3b8;margin-bottom:24px;">Click the button below to reset your password. This link expires in <b style="color:#f8fafc;">15 minutes</b>.</p>
          <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Reset Password</a>
          <p style="color:#475569;font-size:12px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    });
    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (err) {
    console.error('[EMAIL] Password reset email failed:', err.message);
    throw err;
  }
};

module.exports = { sendWelcomeEmail, sendLeaveStatusEmail, sendAssetAssignedEmail, sendPasswordResetEmail };
