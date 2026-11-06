/**
 * Seed team members only — does not affect any other data.
 * Run: node seedTeam.js
 */
require('dotenv').config();
const mongoose   = require('mongoose');
const TeamMember = require('./models/TeamMember');

const members = [
  {
    name:  'Dr. Emmanuel Obi',
    role:  'Founder & CEO',
    bio:   'Former software engineer with 15+ years building enterprise systems across Nigeria and the UK. Founded Apex Tech Academy to democratise technology education.',
    order: 1,
    isVisible: true,
  },
  {
    name:  'Ngozi Adeleke',
    role:  'Head of Curriculum',
    bio:   'EdTech specialist passionate about practical, industry-aligned learning. Holds a Masters in Educational Technology.',
    order: 2,
    isVisible: true,
  },
  {
    name:  'Tunde Balogun',
    role:  'Lead Instructor - Web Development',
    bio:   'Full-stack developer and mentor with experience training 200+ students in web development and software engineering.',
    order: 3,
    isVisible: true,
  },
  {
    name:  'Sarah Okafor',
    role:  'Lead Instructor - Cybersecurity',
    bio:   'Certified ethical hacker and cybersecurity consultant. Previously worked with leading financial institutions on enterprise security.',
    order: 4,
    isVisible: true,
  },
  {
    name:  'Ahmed Musa',
    role:  'Lead Instructor - Data Science',
    bio:   'Data scientist with experience in machine learning and business intelligence. Passionate about making data science accessible.',
    order: 5,
    isVisible: true,
  },
  {
    name:  'Aisha Sule',
    role:  'Student Success Manager',
    bio:   'Dedicated to ensuring every student achieves their career goals. Coordinates career support and mentorship programmes.',
    order: 6,
    isVisible: true,
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await TeamMember.deleteMany({});
    await TeamMember.insertMany(members);

    console.log(`\u2705  ${members.length} team members added successfully!`);
    console.log('\nTeam members on the public About page at /about\n');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
