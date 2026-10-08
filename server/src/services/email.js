'use strict';

/**
 * Send a leave-decision notification email.
 *
 * Safe by design: if SMTP is not configured (no SMTP_HOST) or nodemailer is
 * unavailable, this does nothing and never throws, so the API flow is never
 * broken by email delivery. nodemailer is required lazily for the same reason.
 *
 * @param {{ to?: string, status?: string, decisionNote?: string }} [opts]
 */
async function sendLeaveDecisionEmail(opts = {}) {
  const { to, status, decisionNote } = opts;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !to) {
    return { skipped: true };
  }

  try {
    // Lazy require so a missing nodemailer install can never crash module load.
    const nodemailer = require('nodemailer');
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });

    await transport.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject: `Your leave request was ${status}`,
      text:
        `Your leave request was ${status}.` +
        (decisionNote ? `\n\nNote: ${decisionNote}` : ''),
    });

    return { sent: true };
  } catch (err) {
    // Never let an email failure break the request.
    return { error: err.message };
  }
}

module.exports = { sendLeaveDecisionEmail };
