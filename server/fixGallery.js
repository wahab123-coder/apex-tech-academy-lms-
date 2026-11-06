/**
 * Fix gallery — replace any broken image URLs with working ones.
 * Run: node fixGallery.js
 */
require('dotenv').config();
const mongoose    = require('mongoose');
const GalleryItem = require('./models/GalleryItem');
const User        = require('./models/User');

// Working Unsplash images for each category
const images = [
  {
    title:    'Graduation Ceremony 2026',
    category: 'Ceremonies',
    imageUrl: 'https://images.unsplash.com/photo-1565034946487-077786996e27?w=900&q=85',
    altText:  'Students celebrating graduation',
  },
  {
    title:    'Web Development Bootcamp',
    category: 'Classes',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=85',
    altText:  'Students in a web development class',
  },
  {
    title:    'Tech Career Fair',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=85',
    altText:  'Tech career fair',
  },
  {
    title:    'Certificate Presentation',
    category: 'Ceremonies',
    imageUrl: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=900&q=85',
    altText:  'Certificate presentation ceremony',
  },
  {
    title:    'Cybersecurity Workshop',
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=85',
    altText:  'Cybersecurity workshop',
  },
  {
    title:    'Campus Computer Lab',
    category: 'Classes',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=85',
    altText:  'Students in the computer lab',
  },
  {
    title:    'Data Science Workshop',
    category: 'Workshops',
    imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=85',
    altText:  'Data science training',
  },
  {
    title:    'Open Day 2026',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=85',
    altText:  'Academy open day',
  },
  {
    title:    'Student Projects Showcase',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=900&q=85',
    altText:  'Students presenting projects',
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Run: npm run seed first.');
      process.exit(1);
    }

    // Clear old gallery
    await GalleryItem.deleteMany({});

    // Insert fresh records
    await GalleryItem.insertMany(
      images.map((img) => ({ ...img, uploadedBy: admin._id, isPublished: true }))
    );

    console.log(`\n✅  ${images.length} gallery images inserted successfully!`);
    console.log('   Refresh http://localhost:5173/gallery to see them.\n');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();
