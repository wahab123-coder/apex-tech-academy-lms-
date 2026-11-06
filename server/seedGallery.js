/**
 * Seed gallery with professional tech academy images.
 * Run: node seedGallery.js
 * Does NOT wipe any other data.
 */
require('dotenv').config();
const mongoose   = require('mongoose');
const GalleryItem = require('./models/GalleryItem');
const User        = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) { console.error('No admin found. Run npm run seed first.'); process.exit(1); }

  // Clear existing gallery
  await GalleryItem.deleteMany({});

  await GalleryItem.insertMany([
    {
      title:       'Graduation Ceremony 2026',
      category:    'Ceremonies',
      imageUrl:    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=85',
      altText:     'Students celebrating graduation',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Web Development Bootcamp',
      category:    'Classes',
      imageUrl:    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=85',
      altText:     'Students in a web development class',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Tech Career Fair',
      category:    'Events',
      imageUrl:    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=85',
      altText:     'Tech career fair with exhibitors',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Certificate Presentation',
      category:    'Ceremonies',
      imageUrl:    'https://images.unsplash.com/photo-1598618443855-232ee0f819f6?w=900&q=85',
      altText:     'Student receiving certificate',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Cybersecurity Workshop',
      category:    'Workshops',
      imageUrl:    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=85',
      altText:     'Cybersecurity training session',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Campus Computer Lab',
      category:    'Classes',
      imageUrl:    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=85',
      altText:     'Students working in the computer lab',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Data Science Workshop',
      category:    'Workshops',
      imageUrl:    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=85',
      altText:     'Data science training session',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Open Day 2026',
      category:    'Events',
      imageUrl:    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=85',
      altText:     'Academy open day event',
      uploadedBy:  admin._id,
      isPublished: true,
    },
    {
      title:       'Student Projects Showcase',
      category:    'Events',
      imageUrl:    'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=900&q=85',
      altText:     'Students presenting their projects',
      uploadedBy:  admin._id,
      isPublished: true,
    },
  ]);

  console.log('\n✅  9 gallery images added successfully!');
  console.log('   Visit http://localhost:5173/gallery to see them.\n');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
