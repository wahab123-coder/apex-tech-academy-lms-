/**
 * Apex Tech Academy — Database Seed Script
 * Run: node seed.js
 * Clears existing data and populates the DB with realistic dev/test data.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User        = require('./models/User');
const Course      = require('./models/Course');
const Enrollment  = require('./models/Enrollment');
const Lesson      = require('./models/Lesson');
const Material    = require('./models/Material');
const Assignment  = require('./models/Assignment');
const Submission  = require('./models/Submission');
const Progress    = require('./models/Progress');
const Admission   = require('./models/Admission');
const Payment     = require('./models/Payment');
const Receipt     = require('./models/Receipt');
const Certificate = require('./models/Certificate');
const Announcement = require('./models/Announcement');
const BlogPost    = require('./models/BlogPost');
const Event       = require('./models/Event');
const GalleryItem = require('./models/GalleryItem');
const Project     = require('./models/Project');
const TeamMember  = require('./models/TeamMember');

// ── Colours for console output ─────────────────────────────
const c = {
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => `\x1b[36m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
};

const log = (msg) => console.log(msg);

// ── Main seed function ─────────────────────────────────────
async function seed() {
  log(c.bold('\n🌱  Apex Tech Academy — Database Seeder\n'));

  try {
    await mongoose.connect(process.env.MONGO_URI);
    log(c.green('✅  Connected to MongoDB'));

    // ── 1. Clear all collections ─────────────────────────
    log(c.yellow('\n⚠️   Clearing existing data...'));
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Lesson.deleteMany({}),
      Material.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Progress.deleteMany({}),
      Admission.deleteMany({}),
      Payment.deleteMany({}),
      Receipt.deleteMany({}),
      Certificate.deleteMany({}),
      Announcement.deleteMany({}),
      BlogPost.deleteMany({}),
      Event.deleteMany({}),
      GalleryItem.deleteMany({}),
      Project.deleteMany({}),
      TeamMember.deleteMany({}),
    ]);
    log(c.green('✅  All collections cleared'));

    // ── 2. Create Users ──────────────────────────────────
    log(c.cyan('\n👤  Creating users...'));

    const [admin, instructor1, instructor2, instructor3,
           student1, student2, student3, student4] = await User.create([
      // Admin
      {
        firstName: 'Emmanuel', lastName: 'Obi',
        email: 'admin@apextechacademy.com', phone: '+234 801 000 0001',
        password: 'Admin@1234', role: 'admin', isActive: true, isEmailVerified: true,
        bio: 'Founder and administrator of Apex Tech Academy.',
      },
      // Instructors
      {
        firstName: 'John', lastName: 'Adeyemi',
        email: 'john.adeyemi@apextechacademy.com', phone: '+234 802 000 0001',
        password: 'Instructor@1234', role: 'instructor', isActive: true, isEmailVerified: true,
        bio: 'Full-stack developer with 10+ years of experience. Specialises in React and Node.js.',
      },
      {
        firstName: 'Sarah', lastName: 'Okafor',
        email: 'sarah.okafor@apextechacademy.com', phone: '+234 803 000 0001',
        password: 'Instructor@1234', role: 'instructor', isActive: true, isEmailVerified: true,
        bio: 'Certified ethical hacker and cybersecurity consultant.',
      },
      {
        firstName: 'Ahmed', lastName: 'Musa',
        email: 'ahmed.musa@apextechacademy.com', phone: '+234 804 000 0001',
        password: 'Instructor@1234', role: 'instructor', isActive: true, isEmailVerified: true,
        bio: 'Data scientist with experience in ML and business intelligence.',
      },
      // Students
      {
        firstName: 'Emeka', lastName: 'Okafor',
        email: 'emeka.okafor@student.com', phone: '+234 805 000 0001',
        password: 'Student@1234', role: 'student', isActive: true, isEmailVerified: true,
      },
      {
        firstName: 'Aminat', lastName: 'Bello',
        email: 'aminat.bello@student.com', phone: '+234 806 000 0001',
        password: 'Student@1234', role: 'student', isActive: true, isEmailVerified: true,
      },
      {
        firstName: 'Felix', lastName: 'Johnson',
        email: 'felix.johnson@student.com', phone: '+234 807 000 0001',
        password: 'Student@1234', role: 'student', isActive: true, isEmailVerified: true,
      },
      {
        firstName: 'Zainab', lastName: 'Hassan',
        email: 'zainab.hassan@student.com', phone: '+234 808 000 0001',
        password: 'Student@1234', role: 'student', isActive: true, isEmailVerified: true,
      },
    ]);

    log(c.green(`✅  Created 8 users (1 admin, 3 instructors, 4 students)`));

    // ── 3. Create Courses ────────────────────────────────
    log(c.cyan('\n📚  Creating courses...'));

    const [course1, course2, course3] = await Course.create([
      {
        title: 'Full-Stack Web Development',
        description: 'Master HTML, CSS, JavaScript, React, Node.js and MongoDB to build complete, production-ready web applications from scratch.',
        instructor: instructor1._id,
        level: 'Beginner',
        category: 'Web',
        duration: '6 months',
        price: 299,
        isPublished: true,
        tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
        totalStudents: 3,
      },
      {
        title: 'Cybersecurity Fundamentals',
        description: 'Learn ethical hacking, penetration testing, network security and how to defend systems against real-world threats.',
        instructor: instructor2._id,
        level: 'Intermediate',
        category: 'Security',
        duration: '4 months',
        price: 249,
        isPublished: true,
        tags: ['Ethical Hacking', 'Network Security', 'Penetration Testing'],
        totalStudents: 1,
      },
      {
        title: 'Data Science & Machine Learning',
        description: 'From Python basics to advanced ML algorithms — learn to collect, clean, analyse and model data for real business decisions.',
        instructor: instructor3._id,
        level: 'Intermediate',
        category: 'Data',
        duration: '5 months',
        price: 349,
        isPublished: true,
        tags: ['Python', 'Pandas', 'Scikit-learn', 'Machine Learning'],
        totalStudents: 1,
      },
    ]);

    log(c.green(`✅  Created 3 courses`));

    // ── 4. Create Lessons ────────────────────────────────
    log(c.cyan('\n📖  Creating lessons...'));

    const lessonsData = [
      // Course 1 — Full-Stack Web Dev
      { course: course1._id, title: 'Introduction to HTML',         order: 1, duration: '45 min', isPublished: true },
      { course: course1._id, title: 'CSS Fundamentals & Flexbox',   order: 2, duration: '60 min', isPublished: true },
      { course: course1._id, title: 'JavaScript Basics',            order: 3, duration: '75 min', isPublished: true },
      { course: course1._id, title: 'DOM Manipulation',             order: 4, duration: '60 min', isPublished: true },
      { course: course1._id, title: 'Introduction to React',        order: 5, duration: '90 min', isPublished: true },
      { course: course1._id, title: 'React Hooks & State',          order: 6, duration: '75 min', isPublished: true },
      { course: course1._id, title: 'Node.js & Express Basics',     order: 7, duration: '60 min', isPublished: true },
      { course: course1._id, title: 'MongoDB & Mongoose',           order: 8, duration: '60 min', isPublished: true },
      // Course 2 — Cybersecurity
      { course: course2._id, title: 'Introduction to Cybersecurity',order: 1, duration: '45 min', isPublished: true },
      { course: course2._id, title: 'Network Fundamentals',         order: 2, duration: '60 min', isPublished: true },
      { course: course2._id, title: 'Linux for Security',           order: 3, duration: '75 min', isPublished: true },
      { course: course2._id, title: 'Penetration Testing Basics',   order: 4, duration: '90 min', isPublished: true },
      // Course 3 — Data Science
      { course: course3._id, title: 'Python for Data Science',      order: 1, duration: '60 min', isPublished: true },
      { course: course3._id, title: 'Data Cleaning with Pandas',    order: 2, duration: '60 min', isPublished: true },
      { course: course3._id, title: 'Data Visualisation',           order: 3, duration: '75 min', isPublished: true },
      { course: course3._id, title: 'Intro to Machine Learning',    order: 4, duration: '90 min', isPublished: true },
    ];

    const lessons = await Lesson.insertMany(lessonsData);
    const c1Lessons = lessons.filter((l) => l.course.equals(course1._id));
    const c2Lessons = lessons.filter((l) => l.course.equals(course2._id));
    const c3Lessons = lessons.filter((l) => l.course.equals(course3._id));

    log(c.green(`✅  Created ${lessons.length} lessons`));

    // ── 5. Create Assignments ────────────────────────────
    log(c.cyan('\n📌  Creating assignments...'));

    const assignments = await Assignment.create([
      {
        lesson: c1Lessons[0]._id, course: course1._id, createdBy: instructor1._id,
        title: 'Build Your First HTML Page',
        instructions: 'Create a complete HTML page for a personal portfolio. Include a header, about section, skills list and contact form.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxScore: 100, isPublished: true,
      },
      {
        lesson: c1Lessons[2]._id, course: course1._id, createdBy: instructor1._id,
        title: 'JavaScript DOM Project',
        instructions: 'Build an interactive to-do list application using vanilla JavaScript and DOM manipulation.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxScore: 100, isPublished: true,
      },
      {
        lesson: c1Lessons[4]._id, course: course1._id, createdBy: instructor1._id,
        title: 'React Component Library',
        instructions: 'Build a reusable component library with Button, Card, Modal, and FormField components using React.',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        maxScore: 100, isPublished: true,
      },
      {
        lesson: c2Lessons[3]._id, course: course2._id, createdBy: instructor2._id,
        title: 'Network Vulnerability Report',
        instructions: 'Using the provided test environment, identify and document at least 5 network vulnerabilities with remediation steps.',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        maxScore: 100, isPublished: true,
      },
      {
        lesson: c3Lessons[1]._id, course: course3._id, createdBy: instructor3._id,
        title: 'Exploratory Data Analysis',
        instructions: 'Using the provided dataset, perform a full EDA using Pandas and Matplotlib. Submit a Jupyter notebook.',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        maxScore: 100, isPublished: true,
      },
    ]);

    log(c.green(`✅  Created ${assignments.length} assignments`));

    // ── 6. Create Enrollments ────────────────────────────
    log(c.cyan('\n📝  Creating enrollments...'));

    const enrollments = await Enrollment.create([
      { student: student1._id, course: course1._id, status: 'Active' },
      { student: student2._id, course: course1._id, status: 'Active' },
      { student: student3._id, course: course1._id, status: 'Active' },
      { student: student2._id, course: course2._id, status: 'Active' },
      { student: student4._id, course: course3._id, status: 'Active' },
    ]);

    log(c.green(`✅  Created ${enrollments.length} enrollments`));

    // ── 7. Create Admissions ─────────────────────────────
    log(c.cyan('\n🎓  Creating admissions...'));

    await Admission.create([
      {
        student: student1._id, course: course1._id,
        admissionNumber: 'ATA-2025-001',
        applicationStatus: 'Approved',
        admissionDate: new Date('2025-01-15'),
        reviewedBy: admin._id,
        reviewedAt: new Date('2025-01-14'),
        statement: 'I am passionate about web development and want to build a career in tech.',
      },
      {
        student: student2._id, course: course1._id,
        admissionNumber: 'ATA-2025-002',
        applicationStatus: 'Approved',
        admissionDate: new Date('2025-01-18'),
        reviewedBy: admin._id,
        reviewedAt: new Date('2025-01-17'),
        statement: 'Looking to transition from accounting into tech through this program.',
      },
      {
        student: student2._id, course: course2._id,
        admissionNumber: 'ATA-2025-003',
        applicationStatus: 'Approved',
        admissionDate: new Date('2025-02-01'),
        reviewedBy: admin._id,
        reviewedAt: new Date('2025-01-30'),
        statement: 'Interested in cybersecurity to protect my organisation\'s systems.',
      },
      {
        student: student3._id, course: course1._id,
        admissionNumber: 'ATA-2025-004',
        applicationStatus: 'Approved',
        admissionDate: new Date('2025-02-05'),
        reviewedBy: admin._id,
        reviewedAt: new Date('2025-02-04'),
        statement: 'I want to become a full-stack developer.',
      },
      {
        student: student4._id, course: course3._id,
        admissionNumber: 'ATA-2025-005',
        applicationStatus: 'Approved',
        admissionDate: new Date('2025-03-01'),
        reviewedBy: admin._id,
        reviewedAt: new Date('2025-02-28'),
        statement: 'Data science is the future and I want to be part of it.',
      },
    ]);

    log(c.green(`✅  Created 5 admission records`));

    // ── 8. Create Progress records ───────────────────────
    log(c.cyan('\n📈  Creating progress records...'));

    await Progress.create([
      {
        student: student1._id, course: course1._id,
        completedLessons: [c1Lessons[0]._id, c1Lessons[1]._id, c1Lessons[2]._id,
                           c1Lessons[3]._id, c1Lessons[4]._id],
        progressPercentage: 63,
        isCompleted: false,
      },
      {
        student: student2._id, course: course1._id,
        completedLessons: [c1Lessons[0]._id, c1Lessons[1]._id, c1Lessons[2]._id],
        progressPercentage: 38,
        isCompleted: false,
      },
      {
        student: student3._id, course: course1._id,
        completedLessons: [c1Lessons[0]._id, c1Lessons[1]._id, c1Lessons[2]._id,
                           c1Lessons[3]._id, c1Lessons[4]._id, c1Lessons[5]._id,
                           c1Lessons[6]._id, c1Lessons[7]._id],
        progressPercentage: 100,
        isCompleted: true,
        completedAt: new Date('2026-07-10'),
      },
      {
        student: student2._id, course: course2._id,
        completedLessons: [c2Lessons[0]._id, c2Lessons[1]._id],
        progressPercentage: 50,
        isCompleted: false,
      },
      {
        student: student4._id, course: course3._id,
        completedLessons: [c3Lessons[0]._id],
        progressPercentage: 25,
        isCompleted: false,
      },
    ]);

    log(c.green(`✅  Created 5 progress records`));

    // ── 9. Create Payments & Receipts ────────────────────
    log(c.cyan('\n💳  Creating payments and receipts...'));

    const payments = await Payment.create([
      {
        student: student1._id, course: course1._id,
        amount: 299, currency: 'USD', paymentMethod: 'Card',
        status: 'Verified', verifiedAt: new Date('2025-01-20'),
        verifiedBy: 'webhook', description: 'Course fee — Full-Stack Web Development',
        providerReference: 'REF-20250120-001',
      },
      {
        student: student2._id, course: course1._id,
        amount: 299, currency: 'USD', paymentMethod: 'Bank Transfer',
        status: 'Verified', verifiedAt: new Date('2025-01-22'),
        verifiedBy: admin._id.toString(), description: 'Course fee — Full-Stack Web Development',
        providerReference: 'REF-20250122-001',
      },
      {
        student: student2._id, course: course2._id,
        amount: 249, currency: 'USD', paymentMethod: 'Card',
        status: 'Verified', verifiedAt: new Date('2025-02-03'),
        verifiedBy: 'webhook', description: 'Course fee — Cybersecurity Fundamentals',
        providerReference: 'REF-20250203-001',
      },
      {
        student: student3._id, course: course1._id,
        amount: 299, currency: 'USD', paymentMethod: 'Card',
        status: 'Verified', verifiedAt: new Date('2025-02-07'),
        verifiedBy: 'webhook', description: 'Course fee — Full-Stack Web Development',
        providerReference: 'REF-20250207-001',
      },
      {
        student: student4._id, course: course3._id,
        amount: 349, currency: 'USD', paymentMethod: 'Card',
        status: 'Verified', verifiedAt: new Date('2025-03-03'),
        verifiedBy: 'webhook', description: 'Course fee — Data Science & Machine Learning',
        providerReference: 'REF-20250303-001',
      },
    ]);

    await Receipt.create([
      { payment: payments[0]._id, student: student1._id, course: course1._id, receiptNumber: 'RCP-0001', amount: 299, currency: 'USD', issuedAt: new Date('2025-01-20') },
      { payment: payments[1]._id, student: student2._id, course: course1._id, receiptNumber: 'RCP-0002', amount: 299, currency: 'USD', issuedAt: new Date('2025-01-22') },
      { payment: payments[2]._id, student: student2._id, course: course2._id, receiptNumber: 'RCP-0003', amount: 249, currency: 'USD', issuedAt: new Date('2025-02-03') },
      { payment: payments[3]._id, student: student3._id, course: course1._id, receiptNumber: 'RCP-0004', amount: 299, currency: 'USD', issuedAt: new Date('2025-02-07') },
      { payment: payments[4]._id, student: student4._id, course: course3._id, receiptNumber: 'RCP-0005', amount: 349, currency: 'USD', issuedAt: new Date('2025-03-03') },
    ]);

    log(c.green(`✅  Created ${payments.length} payments and ${payments.length} receipts`));

    // ── 10. Create Submissions ───────────────────────────
    log(c.cyan('\n📤  Creating submissions...'));

    await Submission.create([
      {
        assignment: assignments[0]._id, student: student1._id, course: course1._id,
        notes: 'Completed the HTML portfolio page with all required sections.',
        status: 'Graded', grade: 88, feedback: 'Great structure! Clean semantic HTML. Add more detail to the skills section.',
        gradedBy: instructor1._id, gradedAt: new Date('2026-09-05'),
      },
      {
        assignment: assignments[0]._id, student: student2._id, course: course1._id,
        notes: 'My first ever HTML page — excited to submit!',
        status: 'Graded', grade: 92, feedback: 'Excellent work! Very clean and well-structured. Well done.',
        gradedBy: instructor1._id, gradedAt: new Date('2026-09-06'),
      },
      {
        assignment: assignments[0]._id, student: student3._id, course: course1._id,
        notes: 'Used semantic HTML5 elements throughout.',
        status: 'Graded', grade: 95, feedback: 'Outstanding! One of the best submissions. Publish-ready.',
        gradedBy: instructor1._id, gradedAt: new Date('2026-09-07'),
      },
      {
        assignment: assignments[1]._id, student: student1._id, course: course1._id,
        notes: 'Built a to-do app with local storage persistence.',
        status: 'Pending',
      },
    ]);

    log(c.green(`✅  Created 4 submissions`));

    // ── 11. Create Certificate (for completed student) ───
    log(c.cyan('\n🏆  Creating certificate...'));

    await Certificate.create([
      {
        student: student3._id, course: course1._id,
        enrollment: enrollments[2]._id,
        status: 'Issued',
        grade: 'Distinction',
        issuedAt: new Date('2026-07-15'),
        issuedBy: admin._id,
      },
    ]);

    log(c.green(`✅  Created 1 certificate`));

    // ── 12. Create Announcements ─────────────────────────
    log(c.cyan('\n📢  Creating announcements...'));

    await Announcement.create([
      {
        title: 'New Cohort Starting October 5, 2026',
        message: 'We are excited to announce the start of our next training cohort on October 5, 2026. Applications are now open. Refer a friend and both receive a 10% discount!',
        createdBy: admin._id, audience: 'all', isActive: true,
      },
      {
        title: 'Assignment Deadline Extended — HTML Project',
        message: 'The deadline for the "Build Your First HTML Page" assignment has been extended by 5 days. New deadline: September 25, 2026.',
        createdBy: instructor1._id, audience: 'students', course: course1._id, isActive: true,
      },
      {
        title: 'New Learning Materials Uploaded for Lesson 3',
        message: 'Additional notes and a practice exercise have been uploaded for Lesson 3 — JavaScript Basics. Check the materials section.',
        createdBy: instructor1._id, audience: 'students', course: course1._id, isActive: true,
      },
      {
        title: 'Instructor Monthly Meeting — September 20',
        message: 'All instructors are reminded of the monthly sync meeting on September 20 at 2 PM. Join via the Zoom link that will be shared by email.',
        createdBy: admin._id, audience: 'instructors', isActive: true,
      },
    ]);

    log(c.green(`✅  Created 4 announcements`));

    // ── 13. Create Blog Posts ────────────────────────────
    log(c.cyan('\n✍️   Creating blog posts...'));

    await BlogPost.create([
      {
        title: '10 Skills Every Developer Needs in 2026',
        content: 'The tech landscape is evolving rapidly. Here are the ten skills that will set you apart in the job market this year. From cloud computing to AI integration, modern developers need a broad toolkit...',
        excerpt: 'The tech landscape is evolving fast. Here are the skills that will set you apart in the job market this year.',
        author: instructor1._id, category: 'Career',
        tags: ['Career', 'Skills', 'Developer'],
        isPublished: true, publishedAt: new Date('2026-09-10'), readTime: '5 min read',
      },
      {
        title: 'How to Land Your First Tech Job With No Experience',
        content: 'Breaking into tech without years of experience is absolutely possible. This guide shows you exactly how — from building your portfolio to networking effectively and acing technical interviews...',
        excerpt: 'Breaking into tech without years of experience is possible. This guide shows you exactly how.',
        author: admin._id, category: 'Career',
        tags: ['Career', 'Job Hunt', 'Beginners'],
        isPublished: true, publishedAt: new Date('2026-09-02'), readTime: '7 min read',
      },
      {
        title: 'Cybersecurity Threats to Watch in 2026',
        content: 'From AI-powered phishing to supply chain attacks — here are the threats security professionals are actively tracking this year and how organisations can defend themselves...',
        excerpt: 'AI-powered phishing to supply chain attacks — here are the threats security professionals are tracking.',
        author: instructor2._id, category: 'Security',
        tags: ['Security', 'Threats', 'Enterprise'],
        isPublished: true, publishedAt: new Date('2026-08-20'), readTime: '8 min read',
      },
      {
        title: 'Why Every Developer Should Learn SQL',
        content: 'Databases are everywhere. Whether you\'re building a web app, analysing data or maintaining backend systems, understanding SQL makes you a significantly more effective developer...',
        excerpt: 'Databases are everywhere. Understanding SQL makes you a significantly more effective developer.',
        author: instructor3._id, category: 'Tech',
        tags: ['SQL', 'Databases', 'Backend'],
        isPublished: true, publishedAt: new Date('2026-08-14'), readTime: '4 min read',
      },
    ]);

    log(c.green(`✅  Created 4 blog posts`));

    // ── 14. Create Events ────────────────────────────────
    log(c.cyan('\n📅  Creating events...'));

    await Event.create([
      {
        title: 'Web Development Bootcamp — Cohort 8',
        description: 'Our intensive 3-month web development bootcamp. Covers HTML, CSS, JavaScript, React, Node.js and MongoDB.',
        type: 'Bootcamp', date: new Date('2026-10-05'), time: '9:00 AM',
        location: 'Apex Tech Campus, Victoria Island, Lagos',
        isOnline: false, capacity: 30, createdBy: admin._id, isPublished: true,
      },
      {
        title: 'Cybersecurity Masterclass',
        description: 'A half-day masterclass on ethical hacking fundamentals — open to all skill levels.',
        type: 'Workshop', date: new Date('2026-09-28'), time: '10:00 AM',
        location: 'Online (Zoom)', isOnline: true,
        meetingLink: 'https://zoom.us/j/example', capacity: 100,
        createdBy: admin._id, isPublished: true,
      },
      {
        title: 'Tech Career Fair 2026',
        description: 'Connect with top employers in tech. Bring your CV, portfolio and be ready for on-the-spot interviews.',
        type: 'Career Event', date: new Date('2026-10-20'), time: '11:00 AM',
        location: 'Apex Tech Campus, Victoria Island, Lagos',
        isOnline: false, capacity: 200, createdBy: admin._id, isPublished: true,
      },
      {
        title: 'Graduation Ceremony — Cohort 7',
        description: 'Celebrating the achievement of our Cohort 7 graduates.',
        type: 'Ceremony', date: new Date('2026-09-15'), time: '1:00 PM',
        location: 'Apex Tech Campus, Victoria Island, Lagos',
        isOnline: false, createdBy: admin._id, isPublished: true,
      },
    ]);

    log(c.green(`✅  Created 4 events`));

    // ── 15. Create Projects ──────────────────────────────
    log(c.cyan('\n🔧  Creating projects...'));

    await Project.create([
      {
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce application with product listings, shopping cart, user authentication and Paystack payment integration.',
        student: student3._id, course: course1._id,
        tags: ['React', 'Node.js', 'MongoDB', 'Paystack'],
        repoUrl: 'https://github.com/example/ecommerce',
        liveUrl: 'https://example-ecommerce.vercel.app',
        status: 'Published', publishedAt: new Date('2026-08-01'),
      },
      {
        title: 'Personal Portfolio Website',
        description: 'A responsive personal portfolio built with React showcasing projects, skills and a working contact form.',
        student: student1._id, course: course1._id,
        tags: ['React', 'CSS', 'EmailJS'],
        repoUrl: 'https://github.com/example/portfolio',
        status: 'Published', publishedAt: new Date('2026-07-20'),
      },
    ]);

    log(c.green(`✅  Created 2 projects`));

    // ── 16. Create Gallery Items ─────────────────────────
    log(c.cyan('\n🖼️   Creating gallery items...'));

    await GalleryItem.create([
      {
        title: 'Graduation Ceremony 2026', category: 'Ceremonies',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
        altText: 'Students at graduation ceremony', uploadedBy: admin._id, isPublished: true,
      },
      {
        title: 'Web Development Bootcamp', category: 'Classes',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
        altText: 'Students working during web dev bootcamp', uploadedBy: admin._id, isPublished: true,
      },
      {
        title: 'Tech Career Fair', category: 'Events',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
        altText: 'Tech career fair at Apex Tech Academy', uploadedBy: admin._id, isPublished: true,
      },
      {
        title: 'Certificate Presentation', category: 'Ceremonies',
        imageUrl: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=800&q=80',
        altText: 'Certificate presentation ceremony', uploadedBy: admin._id, isPublished: true,
      },
      {
        title: 'Cybersecurity Workshop', category: 'Workshops',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
        altText: 'Cybersecurity workshop session', uploadedBy: admin._id, isPublished: true,
      },
      {
        title: 'Campus Lab Session', category: 'Classes',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
        altText: 'Students in the computer lab', uploadedBy: admin._id, isPublished: true,
      },
    ]);

    log(c.green(`✅  Created 6 gallery items`));

    // ── 17. Create Team Members ──────────────────────────
    log(c.cyan('\n👥  Creating team members...'));

    await TeamMember.create([
      {
        name:      'Dr. Emmanuel Obi',
        role:      'Founder & CEO',
        bio:       'Former software engineer with 15+ years building enterprise systems across Nigeria and the UK. Founded Apex Tech Academy to democratise technology education.',
        order:     1,
        isVisible: true,
      },
      {
        name:      'Ngozi Adeleke',
        role:      'Head of Curriculum',
        bio:       'EdTech specialist and instructional designer passionate about practical, industry-aligned learning. Holds a Masters in Educational Technology.',
        order:     2,
        isVisible: true,
      },
      {
        name:      'Tunde Balogun',
        role:      'Lead Instructor — Web Development',
        bio:       'Full-stack developer with 8+ years of professional experience. Has mentored and trained over 200 students in web development and software engineering.',
        order:     3,
        isVisible: true,
      },
      {
        name:      'Sarah Okafor',
        role:      'Lead Instructor — Cybersecurity',
        bio:       'Certified ethical hacker (CEH) and cybersecurity consultant. Previously worked with leading financial institutions on enterprise security architecture.',
        order:     4,
        isVisible: true,
      },
      {
        name:      'Ahmed Musa',
        role:      'Lead Instructor — Data Science',
        bio:       'Data scientist with experience in machine learning and business intelligence. Passionate about making data science accessible to African professionals.',
        order:     5,
        isVisible: true,
      },
      {
        name:      'Aisha Sule',
        role:      'Student Success Manager',
        bio:       'Dedicated to ensuring every student achieves their career goals. Coordinates career support, mentorship programmes and student welfare at the academy.',
        order:     6,
        isVisible: true,
      },
    ]);

    log(c.green(`✅  Created 6 team members`));

    // ── Summary ──────────────────────────────────────────
    log(c.bold(c.green('\n✅  Database seeded successfully!\n')));
    log(c.bold('📋  Test Login Credentials:\n'));
    log(`  ${c.cyan('Admin')}      admin@apextechacademy.com       / Admin@1234`);
    log(`  ${c.cyan('Instructor')} john.adeyemi@apextechacademy.com / Instructor@1234`);
    log(`  ${c.cyan('Instructor')} sarah.okafor@apextechacademy.com / Instructor@1234`);
    log(`  ${c.cyan('Student')}    emeka.okafor@student.com         / Student@1234`);
    log(`  ${c.cyan('Student')}    aminat.bello@student.com         / Student@1234`);
    log(`  ${c.cyan('Student')}    felix.johnson@student.com        / Student@1234\n`);

  } catch (err) {
    console.error(c.red(`\n❌  Seed error: ${err.message}`));
    console.error(err);
  } finally {
    await mongoose.connection.close();
    log(c.yellow('🔌  MongoDB connection closed\n'));
    process.exit(0);
  }
}

seed();
