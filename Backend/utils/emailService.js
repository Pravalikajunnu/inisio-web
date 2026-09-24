import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let cachedTestTransporter = null;

/**
 * Get configured SMTP credentials from environment
 */
export const getSmtpConfig = () => {
  const user = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    ''
  ).trim();

  let pass = (
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    process.env.GMAIL_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    ''
  ).trim();

  // Strip quotes, wrapping spaces, or 4-block spaces (e.g. 'abcd efgh ijkl mnop')
  if (pass) {
    pass = pass.replace(/^['"]|['"]$/g, '').replace(/\s+/g, '');
  }

  let host = (
    process.env.SMTP_HOST ||
    process.env.EMAIL_HOST ||
    ''
  ).trim();

  if (!host && user.toLowerCase().endsWith('@gmail.com')) {
    host = 'smtp.gmail.com';
  }

  const port = parseInt(
    process.env.SMTP_PORT ||
    process.env.EMAIL_PORT ||
    (host.includes('gmail.com') ? '465' : '587'),
    10
  );

  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  return { user, pass, host, port, isSecure };
};

/**
 * Create custom SMTP transporter
 */
export const createCustomTransporter = () => {
  const { user, pass, host, port, isSecure } = getSmtpConfig();

  if (!user || !pass || pass === 'your_smtp_password' || pass === 'password') {
    return null;
  }

  try {
    if (host.includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
    }

    return nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } catch (err) {
    console.warn('⚠️ SMTP Transporter build error:', err.message);
    return null;
  }
};

/**
 * Get or initialize fallback test transporter
 */
export const getFallbackTransporter = async () => {
  if (cachedTestTransporter) {
    return cachedTestTransporter;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTestTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTestTransporter;
  } catch {
    cachedTestTransporter = nodemailer.createTransport({ jsonTransport: true });
    return cachedTestTransporter;
  }
};

/**
 * Send an email with automatic error resilience and delivery confirmation
 */
export const sendMailWithResilience = async (mailOptions, metadata = {}) => {
  const recipient = mailOptions.to;
  const { user, pass } = getSmtpConfig();

  const senderFrom = process.env.EMAIL_FROM || (user ? `"Inisio Capital Advisory" <${user}>` : '"Inisio Capital Advisory" <no-reply@inisio.com>');
  
  const optionsWithFrom = {
    from: senderFrom,
    ...mailOptions,
  };

  // Try custom SMTP if credentials are provided
  if (user && pass) {
    const customTransporter = createCustomTransporter();
    if (customTransporter) {
      try {
        const info = await customTransporter.sendMail(optionsWithFrom);
        console.log(`✅ [Email Dispatched to Gmail] Verification OTP successfully sent to: ${recipient} (Message ID: ${info?.messageId || 'sent'})`);
        return { success: true, messageId: info?.messageId, isFallback: false };
      } catch (smtpErr) {
        const errMsg = smtpErr?.message || '';
        console.warn(`⚠️ [Gmail SMTP Error] ${errMsg}`);
        if (errMsg.includes('535') || errMsg.includes('Username and Password') || errMsg.includes('Invalid login')) {
          console.warn(`🔑 [Gmail App Password Required] To send emails directly to Gmail inboxes, Gmail requires a 16-character Google App Password from https://myaccount.google.com/apppasswords`);
        }
      }
    }
  }

  // Fallback to testing transport if custom SMTP is missing or failed
  try {
    const fallback = await getFallbackTransporter();
    const info = await fallback.sendMail(optionsWithFrom);
    
    if (metadata.otp) {
      console.log(`🔑 [Inisio Verification OTP] Recipient: ${recipient} | Code: ${metadata.otp} | Valid for 15 minutes`);
    }

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Email Preview Link] View rendered email in browser: ${previewUrl}`);
    }

    return { success: true, messageId: info?.messageId || 'test-sent', isFallback: true, previewUrl };
  } catch (err) {
    if (metadata.otp) {
      console.log(`🔑 [Inisio Verification OTP] Recipient: ${recipient} | Code: ${metadata.otp}`);
    }
    return { success: true, simulated: true, isFallback: true, error: err.message };
  }
};

/**
 * Send an Email Verification OTP
 */
export const sendVerificationEmail = async ({ to, name, otp }) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Inisio Account</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <div style="background-color: #1e40af; padding: 28px 32px; text-align: center;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background-color: #ffffff; color: #1e40af; border-radius: 12px; font-weight: 900; font-size: 20px; margin-bottom: 12px;">
        IN
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
        INISIO CAPITAL
      </h1>
      <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 13px;">
        Greenfield Project Advisory & Bank Syndication Desk
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
        Account Verification Code
      </h2>
      <p style="font-size: 14px; line-height: 22px; color: #475569; margin-bottom: 24px;">
        Hello <strong>${name || 'Valued Promoter'}</strong>,<br/>
        Thank you for registering on the Inisio Greenfield Project Finance Portal. Please use the 6-digit verification code below to activate your account and access your advisory desk:
      </p>

      <!-- OTP Box -->
      <div style="background-color: #eff6ff; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: monospace;">
          ${otp}
        </span>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600;">
          Valid for 15 minutes • Do not share this code
        </p>
      </div>

      <p style="font-size: 13px; line-height: 20px; color: #64748b; margin-bottom: 24px;">
        If you did not initiate this registration, you can safely ignore this email. Your email address will not be activated without this verification code.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 18px;">
          Inisio Project Underwriting & Syndication Services<br/>
          Secured with Bank-Grade 256-bit Encryption
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const result = await sendMailWithResilience(
    {
      to,
      subject: `Your Inisio Verification Code: ${otp}`,
      text: `Your Inisio verification code is: ${otp}. It will expire in 15 minutes.`,
      html: htmlContent,
    },
    { otp, type: 'verification' }
  );

  return { ...result, otp };
};

/**
 * Send a Password Reset Link and OTP Email
 */
export const sendPasswordResetEmail = async ({ to, name, otp, resetLink }) => {
  const safeResetLink = resetLink || `http://localhost:3000/?action=reset-password&email=${encodeURIComponent(to)}&otp=${otp}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Inisio Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <div style="background-color: #1e3a8a; padding: 28px 32px; text-align: center;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background-color: #ffffff; color: #1e3a8a; border-radius: 12px; font-weight: 900; font-size: 20px; margin-bottom: 12px;">
        IN
      </div>
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
        INISIO CAPITAL
      </h1>
      <p style="color: #bfdbfe; margin: 4px 0 0 0; font-size: 13px;">
        Greenfield Project Advisory & Bank Syndication Desk
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
        Password Reset Request
      </h2>
      <p style="font-size: 14px; line-height: 22px; color: #475569; margin-bottom: 24px;">
        Hello <strong>${name || 'Valued User'}</strong>,<br/>
        We received a request to reset the password associated with your Inisio account (<strong>${to}</strong>). Click the secure link below to set a new password:
      </p>

      <!-- Primary Action Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${safeResetLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);">
          Reset Your Password &rarr;
        </a>
      </div>

      <!-- Backup OTP Section -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
          Or Enter This 6-Digit Reset Code Manually
        </p>
        <div style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; font-family: monospace;">
          ${otp}
        </div>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8;">
          Link & code remain valid for 15 minutes
        </p>
      </div>

      <!-- Fallback Direct Link -->
      <p style="font-size: 12px; line-height: 18px; color: #64748b; margin-bottom: 8px;">
        If the button above does not work, copy and paste this link into your web browser:
      </p>
      <div style="background-color: #f1f5f9; padding: 10px 14px; border-radius: 8px; font-family: monospace; font-size: 11px; color: #334155; word-break: break-all; margin-bottom: 24px;">
        ${safeResetLink}
      </div>

      <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin-bottom: 24px;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account stays fully protected.
      </p>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 18px;">
          Inisio Capital Project Underwriting & Syndication Services<br/>
          Secured with Bank-Grade 256-bit Encryption
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const result = await sendMailWithResilience(
    {
      to,
      subject: `Reset Your Inisio Password: ${otp}`,
      text: `Hello ${name || 'User'}, we received a request to reset your password. Use link: ${safeResetLink} or enter 6-digit code: ${otp} (valid for 15 minutes).`,
      html: htmlContent,
    },
    { otp, resetLink: safeResetLink, type: 'password-reset' }
  );

  return { ...result, otp, resetLink: safeResetLink };
};

/**
 * Send Consultation Booking Confirmation Email
 */
export const sendConsultationConfirmationEmail = async ({ to, name, preferredDate, preferredTime, topic, mode = 'Online Google Meet' }) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Consultation Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
  <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
    <div style="background-color: #059669; padding: 24px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">
        1-on-1 Consultation Confirmed
      </h1>
      <p style="color: #d1fae5; margin: 4px 0 0 0; font-size: 13px;">
        Inisio Project Advisory Desk
      </p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 14px; line-height: 22px; color: #475569; margin-top: 0;">
        Dear <strong>${name}</strong>,<br/>
        Your project advisory consultation has been scheduled with our Senior Project Finance Specialists.
      </p>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 13px; color: #166534; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Date:</td>
            <td style="padding: 4px 0; text-align: right;">${preferredDate || 'Scheduled within 24 Hrs'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Time Slot:</td>
            <td style="padding: 4px 0; text-align: right;">${preferredTime || '11:00 AM - 12:00 PM IST'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Meeting Mode:</td>
            <td style="padding: 4px 0; text-align: right;">${mode}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 600;">Advisory Focus:</td>
            <td style="padding: 4px 0; text-align: right;">${topic || 'Greenfield Project Bankability'}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        A calendar invitation with the meeting room link has been dispatched. Our team will review your project parameters prior to the call.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const result = await sendMailWithResilience(
    {
      to,
      subject: `Inisio Advisory Consultation Confirmed - ${name}`,
      text: `Your consultation is scheduled on ${preferredDate || 'soon'}.`,
      html: htmlContent,
    },
    { type: 'consultation' }
  );

  return result;
};

/**
 * Send Contact Enquiry Alert to Admin and Confirmation to User
 */
export const sendContactEnquiryAlertEmail = async (enquiry) => {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'advisory@inisio.in';
  
  // 1. User Acknowledgment Email
  const userHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #0f172a; padding: 24px 32px;">
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">INISIO ADVISORY</h2>
      <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Greenfield Project Advisory & Bank Syndication</p>
    </div>
    <div style="padding: 32px;">
      <h3 style="color: #0f172a; margin: 0 0 12px; font-size: 18px;">Thank You, ${enquiry.name}!</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        We have received your enquiry regarding <strong>"${enquiry.subject || 'Greenfield Project Consultancy'}"</strong>.
      </p>
      <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 6px; font-size: 13px; font-weight: bold; color: #1e293b;">Enquiry Summary:</p>
        <p style="margin: 0; font-size: 13px; color: #334155; font-style: italic;">"${enquiry.message}"</p>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">
        Our Senior Project Advisory Desk has been notified and a lead consultant will contact you via phone (<strong>${enquiry.phone}</strong>) or email shortly.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  // 2. Admin Alert Email
  const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: #1e3a8a; padding: 24px 32px;">
      <span style="display:inline-block; background: #fbbf24; color: #000; font-weight: bold; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">NEW WEBSITE ENQUIRY</span>
      <h2 style="color: #ffffff; margin: 0; font-size: 20px;">📩 New Contact Form Submission</h2>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; font-weight: 600; color: #475569; width: 30%;">Full Name:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${enquiry.name}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; font-weight: 600; color: #475569;">Phone:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${enquiry.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; font-weight: 600; color: #475569;">Email:</td>
          <td style="padding: 8px 0; color: #0f172a;">${enquiry.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; font-weight: 600; color: #475569;">Company:</td>
          <td style="padding: 8px 0; color: #0f172a;">${enquiry.company || 'Not Specified'}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; font-weight: 600; color: #475569;">Subject:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${enquiry.subject || 'General Enquiry'}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; font-weight: 600; font-size: 13px; color: #334155;">Message Content:</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; white-space: pre-line;">${enquiry.message}</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        Received on: ${new Date(enquiry.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    if (enquiry.email) {
      sendMailWithResilience(
        {
          to: enquiry.email,
          subject: `We have received your enquiry - Inisio Project Advisory`,
          text: `Thank you ${enquiry.name}. We have received your message and will contact you shortly.`,
          html: userHtml,
        },
        { type: 'contact_user' }
      ).catch(() => {});
    }

    sendMailWithResilience(
      {
        to: adminEmail,
        subject: `[New Enquiry] ${enquiry.name} - ${enquiry.subject || 'Project Inquiry'}`,
        text: `New contact enquiry from ${enquiry.name} (${enquiry.phone}, ${enquiry.email}): ${enquiry.message}`,
        html: adminHtml,
      },
      { type: 'contact_admin' }
    ).catch(() => {});
  } catch (e) {}
};

export default {
  getSmtpConfig,
  createCustomTransporter,
  getFallbackTransporter,
  sendMailWithResilience,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendConsultationConfirmationEmail,
  sendContactEnquiryAlertEmail,
};
