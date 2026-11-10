/**
 * Quick admin creation script for production MongoDB Atlas
 * Run: node createAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
console.log('Connecting to:', MONGO_URI?.substring(0, 50) + '...');

const userSchema = new mongoose.Schema({
  firstName:       String,
  lastName:        String,
  email:           { type: String, unique: true },
  phone:           String,
  password:        String,
  role:            { type: String, default: 'student' },
  isActive:        { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  bio:             String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    const existing = await User.findOne({ email: 'admin@apextechacademy.com' });
    if (existing) {
      console.log('ℹ️  Admin already exists — updating password...');
      existing.password        = await bcrypt.hash('Admin@1234', 12);
      existing.role            = 'admin';
      existing.isActive        = true;
      existing.isEmailVerified = true;
      await existing.save();
      console.log('✅ Admin password updated');
    } else {
      const hash = await bcrypt.hash('Admin@1234', 12);
      await User.create({
        firstName:       'Admin',
        lastName:        'User',
        email:           'admin@apextechacademy.com',
        phone:           '+234 801 000 0001',
        password:        hash,
        role:            'admin',
        isActive:        true,
        isEmailVerified: true,
        bio:             'Apex Tech Academy Administrator',
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Login credentials:');
    console.log('   Email:    admin@apextechacademy.com');
    console.log('   Password: Admin@1234');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

createAdmin();
