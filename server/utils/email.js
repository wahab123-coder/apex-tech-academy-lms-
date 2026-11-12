/**
 * Apex Tech Academy — Email Utility
 * Wraps nodemailer with reusable send functions for all system emails.
 * Uses Ethereal (fake SMTP) in development — real SMTP in production.
 */
const nodemailer = require('nodemailer');
const { generateCertificatePDF } = require('./pdf');

// ── Create transporter ─────────────────────────────────────
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧  Ethereal test account: ${testAccount.user}`);
    console.log(`📧  Preview emails at: https://ethereal.email`);
  } else {
    transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

// ── Core send function (supports optional PDF attachment) ──
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from:        process.env.EMAIL_FROM || 'Apex Tech Academy <no-reply@apextechacademy.com>',
      to,
      subject,
      html,
      text:        text || html.replace(/<[^>]+>/g, ''),
      attachments, // [{ filename, content (Buffer), contentType }]
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📧  Email sent to: ${to} | Subject: ${subject}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`📧  Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌  Email send failed to ${to}: ${err.message}`);
    return { success: false, error: err.message };
  }
};

// ── Shared HTML wrapper ────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; color: #0a0f1e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .header  { background: linear-gradient(135deg, #0a0f1e 0%, #1a2a4a 100%); padding: 32px 40px; text-align: center; }
    .header h1 { color: #00d4ff; font-size: 24px; margin: 0 0 6px; letter-spacing: 1px; }
    .header p  { color: rgba(249,250,251,0.65); font-size: 13px; margin: 0; }
    .accent-bar { height: 4px; background: linear-gradient(90deg, #00d4ff, #7c3aed); }
    .body    { padding: 36px 40px; }
    .body h2 { font-size: 22px; color: #0a0f1e; margin: 0 0 16px; }
    .body p  { font-size: 15px; line-height: 1.7; color: #4b5563; margin: 0 0 14px; }
    .highlight { background: #f0fdff; border-left: 4px solid #00d4ff; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight p { margin: 5px 0; font-size: 14px; color: #374151; }
    .highlight .label { font-weight: 700; color: #0a0f1e; min-width: 160px; display: inline-block; }
    .btn { display: inline-block; background: linear-gradient(135deg, #00d4ff, #7c3aed); color: #ffffff !important; text-decoration: none; padding: 13px 30px; border-radius: 8px; font-size: 15px; font-weight: 700; margin: 20px 0; }
    .steps { padding: 0; margin: 16px 0; }
    .steps li { font-size: 14px; color: #4b5563; line-height: 1.8; list-style: none; padding-left: 20px; position: relative; }
    .steps li::before { content: '✓'; position: absolute; left: 0; color: #00d4ff; font-weight: bold; }
    .footer { background: #f4f6fb; padding: 20px 40px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .footer a { color: #00d4ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>APEX TECH ACADEMY</h1>
      <p>Learn Today. Build Tomorrow.</p>
    </div>
    <div class="accent-bar"></div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Apex Tech Academy. All rights reserved.<br/>
      Off Gambari Road, Ilorin, Kwara State, Nigeria<br/>
      <a href="mailto:info@apextechacademy.com">info@apextechacademy.com</a> &nbsp;|&nbsp; 07064359797 &nbsp;|&nbsp; 07081721079
    </div>
  </div>
</body>
</html>`;

// ══════════════════════════════════════════════════════════
// EMAIL FUNCTIONS
// ══════════════════════════════════════════════════════════

/**
 * 1. Welcome email — sent immediately after registration
 */
const sendWelcomeEmail = async (user) => {
  const html = emailWrapper(`
    <h2>Welcome to Apex Tech Academy, ${user.firstName}!</h2>
    <p>We are thrilled to have you join our growing community of learners and future tech professionals.</p>
    <p>Your account has been created successfully. Here is what you can do right away:</p>
    <ul class="steps">
      <li>Browse and apply for available courses</li>
      <li>Access your personal student portal</li>
      <li>Track your learning progress</li>
      <li>Connect with instructors and fellow students</li>
    </ul>
    <a href="${process.env.CLIENT_URL}/student" class="btn">Go to Your Portal</a>
    <p>If you have any questions, feel free to reach out via our <a href="${process.env.CLIENT_URL}/contact" style="color:#00d4ff;">Contact page</a> or call us directly.</p>
    <p>We look forward to seeing you grow with us!</p>
  `);

  return sendEmail({
    to:      user.email,
    subject: 'Welcome to Apex Tech Academy — Your Journey Starts Here',
    html,
  });
};

/**
 * 2. Congratulations email — sent when admin approves an application
 *    Includes the admission letter PDF as an attachment
 */
const sendAdmissionApprovalEmail = async ({ student, course, admissionNumber, admissionDate }) => {
  const formattedDate = new Date(admissionDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const html = emailWrapper(`
    <h2>Congratulations, ${student.firstName}! Your Application Has Been Approved!</h2>

    <p style="font-size:16px; color:#0a0f1e; font-weight:600;">
      We are delighted to inform you that your application to <strong>${course.title}</strong>
      at Apex Tech Academy has been officially approved.
    </p>

    <p>
      This is a great achievement and we are proud to welcome you into our academy.
      Your dedication and enthusiasm stood out, and we are confident you will thrive in this programme.
    </p>

    <div class="highlight">
      <p><span class="label">Student Name:</span> ${student.firstName} ${student.lastName}</p>
      <p><span class="label">Admission Number:</span> ${admissionNumber}</p>
      <p><span class="label">Programme:</span> ${course.title}</p>
      ${course.level    ? `<p><span class="label">Level:</span> ${course.level}</p>` : ''}
      ${course.duration ? `<p><span class="label">Duration:</span> ${course.duration}</p>` : ''}
      <p><span class="label">Admission Date:</span> ${formattedDate}</p>
    </div>

    <p><strong>Your next steps:</strong></p>
    <ul class="steps">
      <li>Log in to your student portal to view your admission details</li>
      <li>Complete your tuition payment to secure your place</li>
      <li>Attend orientation on your scheduled start date</li>
      <li>Prepare yourself — your tech journey begins now!</li>
    </ul>

    <a href="${process.env.CLIENT_URL}/student/admission" class="btn">View My Admission</a>

    <p>
      Your official admission letter is attached to this email as a PDF.
      Please save it for your records and present it at orientation.
    </p>

    <p>
      Please save your admission number <strong>(${admissionNumber})</strong> — you will need it
      for all academy correspondence.
    </p>

    <p>Warm regards,<br/><strong>The Admissions Team</strong><br/>Apex Tech Academy</p>
  `);

  // Generate and attach the admission letter PDF
  let attachments = [];
  try {
    const { generateAdmissionLetterPDF } = require('./pdf');
    const pdfBuffer = await generateAdmissionLetterPDF({
      student, course, admissionNumber, admissionDate,
    });
    attachments = [{
      filename:    `Apex-Tech-Admission-Letter-${admissionNumber}.pdf`,
      content:     pdfBuffer,
      contentType: 'application/pdf',
    }];
  } catch (err) {
    console.error('Admission letter PDF generation failed:', err.message);
  }

  return sendEmail({
    to:      student.email,
    subject: `Congratulations! You Have Been Admitted — ${course.title} | Apex Tech Academy`,
    html,
    attachments,
  });
};

/**
 * 3. Admission rejection email
 */
const sendAdmissionRejectionEmail = async ({ student, course, notes }) => {
  const html = emailWrapper(`
    <h2>Application Update — ${student.firstName} ${student.lastName}</h2>
    <p>Thank you for your interest in <strong>${course.title}</strong> at Apex Tech Academy.</p>
    <p>
      After careful review of your application, we regret to inform you that we are unable
      to offer you admission at this time.
    </p>
    ${notes ? `
    <div class="highlight">
      <p><span class="label">Feedback:</span> ${notes}</p>
    </div>` : ''}
    <p>We encourage you to:</p>
    <ul class="steps">
      <li>Review the course requirements and reapply in the next intake</li>
      <li>Explore our other available courses</li>
      <li>Contact us for guidance on the best course for your goals</li>
    </ul>
    <a href="${process.env.CLIENT_URL}/courses" class="btn">Explore Other Courses</a>
    <p>We wish you the very best in your journey.</p>
  `);

  return sendEmail({
    to:      student.email,
    subject: 'Application Update — Apex Tech Academy',
    html,
  });
};

/**
 * 4. Contact form — notification to academy admin
 */
const sendContactNotification = async ({ name, email, subject, message }) => {
  const html = emailWrapper(`
    <h2>New Contact Form Submission</h2>
    <div class="highlight">
      <p><span class="label">From:</span> ${name}</p>
      <p><span class="label">Email:</span> ${email}</p>
      <p><span class="label">Subject:</span> ${subject}</p>
    </div>
    <p><strong>Message:</strong></p>
    <p style="background:#f4f6fb; padding:16px; border-radius:8px; font-style:italic; border-left:4px solid #e5e7eb;">
      ${message}
    </p>
    <p>Reply directly to <a href="mailto:${email}" style="color:#00d4ff;">${email}</a></p>
  `);

  return sendEmail({
    to:      process.env.EMAIL_USER,
    subject: `New Contact: ${subject}`,
    html,
  });
};

/**
 * 5. Contact form — auto-reply to sender
 */
const sendContactAutoReply = async ({ name, email, subject }) => {
  const html = emailWrapper(`
    <h2>We Received Your Message, ${name}!</h2>
    <p>Thank you for reaching out to Apex Tech Academy. We have received your message regarding:</p>
    <div class="highlight">
      <p><span class="label">Subject:</span> ${subject}</p>
    </div>
    <p>
      Our team will review your message and respond within <strong>24 hours</strong>
      during business days (Monday to Friday, 8:00 AM – 6:00 PM).
    </p>
    <a href="${process.env.CLIENT_URL}/courses" class="btn">Explore Our Courses</a>
    <p>Thank you for your interest in Apex Tech Academy.</p>
  `);

  return sendEmail({
    to:      email,
    subject: 'We Received Your Message — Apex Tech Academy',
    html,
  });
};

/**
 * 6. Payment receipt email
 */
const sendPaymentReceiptEmail = async ({ student, receipt, course }) => {
  const html = emailWrapper(`
    <h2>Payment Receipt — ${receipt.receiptNumber}</h2>
    <p>Dear ${student.firstName}, your payment has been verified successfully. Here is your receipt:</p>
    <div class="highlight">
      <p><span class="label">Receipt Number:</span> ${receipt.receiptNumber}</p>
      <p><span class="label">Course:</span> ${course?.title || 'N/A'}</p>
      <p><span class="label">Amount:</span> ${receipt.currency} ${receipt.amount}</p>
      <p><span class="label">Date:</span> ${new Date(receipt.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><span class="label">Status:</span> <span style="color:#10b981; font-weight:700;">Verified</span></p>
    </div>
    <a href="${process.env.CLIENT_URL}/student/receipts" class="btn">View My Receipts</a>
    <p>Please keep this email as your payment confirmation.</p>
  `);

  return sendEmail({
    to:      student.email,
    subject: `Payment Receipt ${receipt.receiptNumber} — Apex Tech Academy`,
    html,
  });
};

/**
 * 7. Certificate email — with PDF certificate attached
 *    PDF is generated server-side and attached directly to the email.
 */
const sendCertificateEmail = async ({ student, course, certificateId, grade, issuedAt }) => {
  // Generate the certificate PDF as a Buffer
  let pdfBuffer = null;
  try {
    pdfBuffer = await generateCertificatePDF({
      student,
      course,
      certificateId,
      grade,
      issuedAt: issuedAt || new Date(),
    });
  } catch (err) {
    console.error('Certificate PDF generation failed:', err.message);
    // Still send the email — just without the attachment
  }

  const html = emailWrapper(`
    <h2>Your Certificate is Ready, ${student.firstName}!</h2>

    <p style="font-size:16px; color:#0a0f1e;">
      Congratulations on completing <strong>${course.title}</strong>!
      This is a tremendous achievement and we are incredibly proud of you.
    </p>

    <p>
      Your Certificate of Completion has been officially issued and is
      ${pdfBuffer ? 'attached to this email as a PDF.' : 'available in your student portal.'}
      You can use it to showcase your skills to employers and on professional platforms.
    </p>

    <div class="highlight">
      <p><span class="label">Certificate ID:</span> ${certificateId}</p>
      <p><span class="label">Programme:</span> ${course.title}</p>
      ${grade ? `<p><span class="label">Grade:</span> <span style="color:#10b981; font-weight:700;">${grade}</span></p>` : ''}
      <p><span class="label">Issue Date:</span> ${new Date(issuedAt || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <p>
      <strong>Verify your certificate online:</strong><br/>
      <a href="${process.env.CLIENT_URL}/verify/${certificateId}" style="color:#00d4ff; word-break:break-all;">
        ${process.env.CLIENT_URL}/verify/${certificateId}
      </a>
    </p>

    <a href="${process.env.CLIENT_URL}/student/certificates" class="btn">View My Certificate</a>

    <p>
      Keep building on what you have learned — this is just the beginning of your tech journey.
      We look forward to seeing you achieve even greater things.
    </p>

    <p>With pride,<br/><strong>The Apex Tech Academy Team</strong></p>
  `);

  // Build attachments array — only add PDF if it was generated successfully
  const attachments = pdfBuffer
    ? [{
        filename:    `Apex-Tech-Certificate-${certificateId}.pdf`,
        content:     pdfBuffer,
        contentType: 'application/pdf',
      }]
    : [];

  return sendEmail({
    to:      student.email,
    subject: `Your Certificate of Completion — ${course.title} | Apex Tech Academy`,
    html,
    attachments,
  });
};

/**
 * 8. Password reset email — sent to the student's registered email address
 */
const sendPasswordResetEmail = async ({ user, resetUrl }) => {
  const expiresIn = '30 minutes';

  const html = emailWrapper(`
    <h2>Password Reset Request</h2>
    <p>Dear ${user.firstName},</p>
    <p>
      We received a request to reset the password for your Apex Tech Academy account
      associated with <strong>${user.email}</strong>.
    </p>
    <p>
      Click the button below to reset your password. This link will expire in
      <strong>${expiresIn}</strong>.
    </p>
    <a href="${resetUrl}" class="btn" style="display:inline-block; margin: 20px 0;">
      Reset My Password
    </a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="background:#f4f6fb; padding:12px 16px; border-radius:8px; word-break:break-all; font-size:13px; color:#6b7280;">
      ${resetUrl}
    </p>
    <div class="highlight" style="margin-top:20px;">
      <p style="margin:0; font-size:13px; color:#374151;">
        <strong>Did not request this?</strong> You can safely ignore this email.
        Your password will not change unless you click the link above.
      </p>
    </div>
    <p style="font-size:13px; color:#9ca3af; margin-top:16px;">
      This link expires in ${expiresIn} for your security.
    </p>
  `);

  return sendEmail({
    to:      user.email,
    subject: 'Reset Your Password — Apex Tech Academy',
    html,
  });
};

/**
 * 9. Admin/instructor sends a message to a student — email notification
 */
const sendMessageEmail = async ({ from, to, subject, body }) => {
  const html = emailWrapper(`
    <h2>New Message from Apex Tech Academy</h2>
    <p>Dear ${to.firstName},</p>
    <p>You have received a new message from <strong>${from.firstName} ${from.lastName}</strong>:</p>
    <div class="highlight" style="background:#f0f9ff; border-left:4px solid #00d4ff;">
      <p style="font-weight:700; margin-bottom:8px; color:#0a0f1e;">${subject || 'No subject'}</p>
      <p style="white-space:pre-line; color:#374151;">${body}</p>
    </div>
    <a href="${process.env.CLIENT_URL}/student/messages" class="btn">View Message</a>
    <p style="font-size:13px; color:#9ca3af; margin-top:16px;">
      Log in to your portal to reply to this message.
    </p>
  `);

  return sendEmail({
    to:      to.email,
    subject: subject ? `${subject} — Apex Tech Academy` : 'New Message — Apex Tech Academy',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendAdmissionApprovalEmail,
  sendAdmissionRejectionEmail,
  sendContactNotification,
  sendContactAutoReply,
  sendPaymentReceiptEmail,
  sendCertificateEmail,
  sendPasswordResetEmail,
  sendMessageEmail,
};
