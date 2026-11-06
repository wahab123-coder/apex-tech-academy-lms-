/**
 * Apex Tech Academy — PDF Generator
 * Generates professional PDF documents:
 *   1. Admission Letter  — after admin approves application
 *   2. Certificate PDF   — after admin issues certificate
 *
 * Both return a Buffer for streaming directly to the client.
 */
const PDFDocument = require('pdfkit');

// ── Brand colours ──────────────────────────────────────────
const C = {
  dark:      '#0a0f1e',
  navy:      '#1a2a4a',
  primary:   '#00d4ff',
  purple:    '#7c3aed',
  white:     '#ffffff',
  text:      '#1f2937',
  muted:     '#6b7280',
  light:     '#f9fafb',
  border:    '#e5e7eb',
  success:   '#10b981',
};

// ── Helper: build PDF from a drawing function → Buffer ─────
const buildPDF = (fn, opts = {}) =>
  new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 0, size: 'A4', ...opts });
    const chunks = [];
    doc.on('data',  (c) => chunks.push(c));
    doc.on('end',   ()  => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    fn(doc);
    doc.end();
  });

// ── Helper: filled rectangle ───────────────────────────────
const fillRect = (doc, x, y, w, h, color) =>
  doc.save().rect(x, y, w, h).fill(color).restore();

// ── Helper: horizontal line ────────────────────────────────
const hLine = (doc, y, x1, x2, color = C.border, width = 0.5) =>
  doc.save().moveTo(x1, y).lineTo(x2, y)
    .strokeColor(color).lineWidth(width).stroke().restore();

// ── Helper: gradient simulation (two rects) ───────────────
const gradientBar = (doc, x, y, w, h) => {
  fillRect(doc, x,       y, w / 2, h, C.primary);
  fillRect(doc, x + w/2, y, w / 2, h, C.purple);
};

// ══════════════════════════════════════════════════════════
//  ADMISSION LETTER PDF
// ══════════════════════════════════════════════════════════
/**
 * @param {object} opts
 * @param {{ firstName, lastName, email }} opts.student
 * @param {{ title, level, duration }}     opts.course
 * @param {string}  opts.admissionNumber
 * @param {Date}    opts.admissionDate
 * @returns {Promise<Buffer>}
 */
const generateAdmissionLetterPDF = ({ student, course, admissionNumber, admissionDate }) =>
  buildPDF((doc) => {
    const W  = doc.page.width;   // 595.28
    const H  = doc.page.height;  // 841.89
    const M  = 50;               // margin
    const CW = W - M * 2;        // content width

    // ── Header background ──────────────────────────────────
    fillRect(doc, 0, 0, W, 130, C.dark);

    // Academy name
    doc.font('Helvetica-Bold').fontSize(20)
      .fillColor(C.primary)
      .text('APEX TECH ACADEMY', M, 32, { width: CW, align: 'center', characterSpacing: 3 });

    doc.font('Helvetica').fontSize(10)
      .fillColor('rgba(249,250,251,0.6)')
      .text('Learn Today. Build Tomorrow.', M, 60, { width: CW, align: 'center' });

    doc.font('Helvetica').fontSize(9)
      .fillColor('rgba(249,250,251,0.4)')
      .text('Off Gambari Road, Ilorin, Kwara State, Nigeria  |  info@apextechacademy.com  |  07064359797', M, 80, { width: CW, align: 'center' });

    // Accent bar
    gradientBar(doc, 0, 128, W, 4);

    // ── Reference block ────────────────────────────────────
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const admDate = new Date(admissionDate).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    doc.font('Helvetica').fontSize(10).fillColor(C.muted)
      .text(`Ref: ${admissionNumber}`, M, 152)
      .text(`Date: ${today}`, W - M - 120, 152);

    // ── Document title ─────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(16).fillColor(C.dark)
      .text('LETTER OF ADMISSION', M, 190, { width: CW, align: 'center', characterSpacing: 2 });

    hLine(doc, 215, M, W - M, C.border, 0.8);

    // ── Salutation ─────────────────────────────────────────
    doc.font('Helvetica').fontSize(11).fillColor(C.text)
      .text(`Dear ${student.firstName} ${student.lastName},`, M, 232);

    // ── Opening paragraph ─────────────────────────────────
    doc.moveDown(0.7)
      .font('Helvetica').fontSize(11).fillColor(C.text)
      .text(
        'We are pleased to inform you that your application to Apex Tech Academy has been ' +
        'carefully reviewed and we are delighted to offer you a place in our programme. ' +
        'On behalf of the entire team, we congratulate you on this achievement and warmly ' +
        'welcome you into our growing community of learners.',
        M, doc.y, { width: CW, lineGap: 3 }
      );

    // ── Admission details box ─────────────────────────────
    const boxY = doc.y + 22;
    const boxH = 148;

    // Box background
    fillRect(doc, M, boxY, CW, boxH, '#f0fdff');

    // Left accent border
    fillRect(doc, M, boxY, 4, boxH, C.primary);

    // Box heading
    doc.font('Helvetica-Bold').fontSize(10).fillColor(C.dark)
      .text('ADMISSION DETAILS', M + 16, boxY + 14, { characterSpacing: 1 });

    hLine(doc, boxY + 32, M + 16, M + CW - 16, 'rgba(0,212,255,0.3)', 0.5);

    const details = [
      ['Student Name',     `${student.firstName} ${student.lastName}`],
      ['Admission Number', admissionNumber],
      ['Programme',        course.title],
      ['Level',            course.level    || 'N/A'],
      ['Duration',         course.duration || 'N/A'],
      ['Admission Date',   admDate],
    ];

    details.forEach(([label, value], i) => {
      const rowY = boxY + 42 + i * 17;
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(C.muted)
        .text(label + ':', M + 16, rowY, { width: 150 });
      doc.font('Helvetica').fontSize(9.5).fillColor(C.text)
        .text(value, M + 170, rowY, { width: CW - 190 });
    });

    // ── Congratulatory paragraph ──────────────────────────
    const p2Y = boxY + boxH + 20;
    doc.font('Helvetica').fontSize(11).fillColor(C.text)
      .text(
        'This admission is a testament to your potential and commitment. We are confident ' +
        'you will make the most of this opportunity and contribute meaningfully to the ' +
        'Apex Tech Academy community.',
        M, p2Y, { width: CW, lineGap: 3 }
      );

    // ── Next steps ────────────────────────────────────────
    doc.moveDown(0.8)
      .font('Helvetica-Bold').fontSize(11).fillColor(C.dark)
      .text('NEXT STEPS', M, doc.y);

    const steps = [
      'Log in to your Student Portal at apextechacademy.com',
      'Complete your tuition payment to secure your enrolment',
      'Attend your scheduled orientation session',
      'Keep this letter for all official correspondence with the academy',
    ];

    steps.forEach((step, i) => {
      const sy = doc.y + (i === 0 ? 14 : 4);
      // Number circle
      doc.save()
        .circle(M + 8, sy + 6, 8)
        .fill(C.primary)
        .restore();
      doc.font('Helvetica-Bold').fontSize(9).fillColor(C.dark)
        .text(String(i + 1), M + 4.5, sy + 2);
      doc.font('Helvetica').fontSize(10).fillColor(C.text)
        .text(step, M + 24, sy, { width: CW - 24 });
    });

    // ── Closing ───────────────────────────────────────────
    doc.moveDown(1.2)
      .font('Helvetica').fontSize(11).fillColor(C.text)
      .text('We wish you a successful and rewarding academic journey.', M, doc.y)
      .moveDown(0.6)
      .text('Yours sincerely,')
      .moveDown(0.5)
      .font('Helvetica-Bold')
      .text('The Admissions Office')
      .font('Helvetica')
      .text('Apex Tech Academy');

    // ── Footer ────────────────────────────────────────────
    gradientBar(doc, 0, H - 38, W, 4);
    fillRect(doc, 0, H - 34, W, 34, C.dark);

    doc.font('Helvetica').fontSize(8.5)
      .fillColor('rgba(249,250,251,0.45)')
      .text(
        'This is an official document issued by Apex Tech Academy. ' +
        'Off Gambari Road, Ilorin, Kwara State, Nigeria',
        M, H - 22, { width: CW, align: 'center' }
      );
  });

// ══════════════════════════════════════════════════════════
//  CERTIFICATE OF COMPLETION PDF — White Background, Gold & Navy
// ══════════════════════════════════════════════════════════
/**
 * @param {object} opts
 * @param {{ firstName, lastName }} opts.student
 * @param {{ title, level }}        opts.course
 * @param {string}  opts.certificateId
 * @param {string}  opts.grade
 * @param {Date}    opts.issuedAt
 * @returns {Promise<Buffer>}
 */
const generateCertificatePDF = ({ student, course, certificateId, grade, issuedAt }) =>
  buildPDF((doc) => {
    const W = doc.page.width;
    const H = doc.page.height;

    // ── Colours for white certificate ────────────────────
    const GOLD       = '#c5a028';
    const GOLD_LIGHT = '#e8d490';
    const NAVY       = '#0a1a3e';
    const NAVY_LIGHT = '#1a2a5e';
    const TEXT_DARK  = '#1a1a2e';
    const TEXT_MID   = '#4a4a6a';
    const TEXT_MUTE  = '#8a8a9a';
    const BG_TINT    = '#faf8f3'; // very subtle warm white

    // ── Full white background ─────────────────────────────
    fillRect(doc, 0, 0, W, H, C.white);

    // ── Subtle warm tint border area ──────────────────────
    fillRect(doc, 0, 0, W, H, BG_TINT);

    // ── Inner white content area ──────────────────────────
    fillRect(doc, 34, 34, W - 68, H - 68, C.white);

    // ── Outer gold border ─────────────────────────────────
    doc.save().rect(22, 22, W - 44, H - 44)
      .strokeColor(GOLD).lineWidth(2.5).stroke().restore();

    // ── Inner navy border ─────────────────────────────────
    doc.save().rect(30, 30, W - 60, H - 60)
      .strokeColor(NAVY).lineWidth(1).stroke().restore();

    // ── Thin gold inner accent ────────────────────────────
    doc.save().rect(36, 36, W - 72, H - 72)
      .strokeColor(GOLD_LIGHT).lineWidth(0.5).stroke().restore();

    // ── Corner ornaments (gold) ──────────────────────────
    const cornerSize = 16;
    // Top-left
    doc.save()
      .moveTo(30, 30 + cornerSize).lineTo(30, 30).lineTo(30 + cornerSize, 30)
      .strokeColor(GOLD).lineWidth(2.5).stroke().restore();
    // Top-right
    doc.save()
      .moveTo(W - 30 - cornerSize, 30).lineTo(W - 30, 30).lineTo(W - 30, 30 + cornerSize)
      .strokeColor(GOLD).lineWidth(2.5).stroke().restore();
    // Bottom-left
    doc.save()
      .moveTo(30, H - 30 - cornerSize).lineTo(30, H - 30).lineTo(30 + cornerSize, H - 30)
      .strokeColor(GOLD).lineWidth(2.5).stroke().restore();
    // Bottom-right
    doc.save()
      .moveTo(W - 30 - cornerSize, H - 30).lineTo(W - 30, H - 30).lineTo(W - 30, H - 30 - cornerSize)
      .strokeColor(GOLD).lineWidth(2.5).stroke().restore();

    // ── Top gold bar ──────────────────────────────────────
    fillRect(doc, 36, 36, W - 72, 6, GOLD);

    // ── Academy name ──────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(13)
      .fillColor(NAVY)
      .text('APEX TECH ACADEMY', 50, 60, { width: W - 100, align: 'center', characterSpacing: 4 });

    // ── Tagline ───────────────────────────────────────────
    doc.font('Helvetica-Oblique').fontSize(10)
      .fillColor(GOLD)
      .text('Learn Today. Build Tomorrow.', 50, 78, { width: W - 100, align: 'center' });

    // ── Divider with gold accent ──────────────────────────
    hLine(doc, 100, W / 2 - 80, W / 2 + 80, GOLD, 1);

    // ── Certificate title ─────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(34)
      .fillColor(NAVY)
      .text('Certificate', 50, 112, { width: W - 100, align: 'center' });

    doc.font('Helvetica').fontSize(12)
      .fillColor(TEXT_MUTE)
      .text('O F   C O M P L E T I O N', 50, 156, {
        width: W - 100, align: 'center', characterSpacing: 5,
      });

    // ── Decorative gold circle behind star ────────────────
    doc.save()
      .circle(W / 2, 215, 36)
      .fill('rgba(197,160,40,0.06)')
      .restore();
    doc.save()
      .circle(W / 2, 215, 36)
      .strokeColor(GOLD_LIGHT).lineWidth(1).stroke()
      .restore();
    doc.save()
      .circle(W / 2, 215, 28)
      .strokeColor('rgba(197,160,40,0.2)').lineWidth(0.5).stroke()
      .restore();

    // Star symbol (gold)
    doc.font('Helvetica-Bold').fontSize(38)
      .fillColor(GOLD)
      .text('\u2605', 50, 192, { width: W - 100, align: 'center' });

    // ── Presented to ──────────────────────────────────────
    doc.font('Helvetica').fontSize(12)
      .fillColor(TEXT_MUTE)
      .text('This is to certify that', 50, 268, { width: W - 100, align: 'center' });

    // ── Student name (navy, large) ────────────────────────
    doc.font('Helvetica-Bold').fontSize(32)
      .fillColor(NAVY)
      .text(`${student.firstName} ${student.lastName}`, 50, 292, {
        width: W - 100, align: 'center',
      });

    // ── Gold underline under name ────────────────────────
    const nameBottom = doc.y + 6;
    doc.save()
      .moveTo(W / 2 - 140, nameBottom).lineTo(W / 2 + 140, nameBottom)
      .strokeColor(GOLD).lineWidth(1).stroke()
      .restore();

    // ── Body text ─────────────────────────────────────────
    doc.font('Helvetica').fontSize(12)
      .fillColor(TEXT_MID)
      .text('has successfully completed the programme', 50, nameBottom + 18, {
        width: W - 100, align: 'center',
      });

    // ── Course name (gold) ────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(20)
      .fillColor(GOLD)
      .text(course.title, 50, doc.y + 16, { width: W - 100, align: 'center' });

    // ── Grade badge (navy with gold border) ───────────────
    if (grade) {
      const gy = doc.y + 20;
      const gw = 170; const gh = 34;
      const gx = (W - gw) / 2;
      // Navy background
      doc.save().roundedRect(gx, gy, gw, gh, 17)
        .fill(NAVY).restore();
      // Gold border
      doc.save().roundedRect(gx, gy, gw, gh, 17)
        .strokeColor(GOLD).lineWidth(1.5).stroke().restore();
      // Grade text (white on navy)
      doc.font('Helvetica-Bold').fontSize(12).fillColor(C.white)
        .text(`Grade: ${grade}`, gx, gy + 10, { width: gw, align: 'center' });
    }

    // ── Details section ───────────────────────────────────
    const detY = H - 200;
    hLine(doc, detY, 50, W - 50, GOLD_LIGHT, 0.8);

    // Three columns
    const issueDate = new Date(issuedAt || new Date()).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const cols = [
      { label: 'Certificate ID',  value: certificateId },
      { label: 'Date of Issue',   value: issueDate },
      { label: 'Issued By',       value: 'Apex Tech Academy' },
    ];

    const cw = (W - 100) / 3;
    cols.forEach((col, i) => {
      const cx = 50 + i * cw;
      // Label (gold, uppercase)
      doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD)
        .text(col.label.toUpperCase(), cx, detY + 18, { width: cw, align: 'center', characterSpacing: 1 });
      // Value (navy)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY)
        .text(col.value, cx, detY + 36, { width: cw, align: 'center' });
    });

    // ── Signature line (gold) ─────────────────────────────
    const sigY = detY + 78;
    hLine(doc, sigY, W / 2 - 80, W / 2 + 80, NAVY, 0.8);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY)
      .text('Director, Apex Tech Academy', 50, sigY + 10, { width: W - 100, align: 'center' });
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(TEXT_MUTE)
      .text('Off Gambari Road, Ilorin, Kwara State, Nigeria', 50, sigY + 26, { width: W - 100, align: 'center' });

    // ── Verification note ─────────────────────────────────
    doc.font('Helvetica').fontSize(8.5).fillColor(TEXT_MUTE)
      .text(
        `Verify at: apextechacademy.com/verify/${certificateId}`,
        50, sigY + 46, { width: W - 100, align: 'center' }
      );

    // ── Bottom gold bar ───────────────────────────────────
    fillRect(doc, 36, H - 42, W - 72, 6, GOLD);
  });

module.exports = { generateAdmissionLetterPDF, generateCertificatePDF };
