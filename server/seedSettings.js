/**
 * Seed default academy settings.
 * Run: node seedSettings.js
 * Safe to run multiple times — uses upsert.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Setting  = require('./models/Setting');

const defaults = [
  {
    key:         'session_timeout',
    value:       '30',
    label:       'Session Timeout (minutes)',
    description: 'Auto-logout users from portals after this many minutes of inactivity. Public pages are not affected.',
    category:    'security',
  },
  {
    key:         'academy_name',
    value:       'Apex Tech Academy',
    label:       'Academy Name',
    description: 'The name of the academy shown across the platform.',
    category:    'general',
  },
  {
    key:         'academy_email',
    value:       'info@apextechacademy.com',
    label:       'Academy Email',
    description: 'Primary contact email address.',
    category:    'general',
  },
  {
    key:         'academy_phone',
    value:       '07064359797',
    label:       'Academy Phone',
    description: 'Primary contact phone number.',
    category:    'general',
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const setting of defaults) {
      await Setting.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, new: true }
      );
    }

    console.log(`\n✅  ${defaults.length} settings seeded successfully!\n`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
