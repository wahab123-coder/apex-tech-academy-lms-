/**
 * Apex Tech Academy — Gallery Seed
 * Run: node seedGallery.js
 * Seeds the gallery with professional education/tech photos from Unsplash
 */
require('dotenv').config();
const mongoose    = require('mongoose');
const GalleryItem = require('./models/GalleryItem');
const User        = require('./models/User');

const galleryImages = [
  // Students learning
  {
    title:       'Students in Tech Class',
    caption:     'Students actively engaged in a hands-on programming session at Apex Tech Academy.',
    category:    'Students',
    imageUrl:    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  },
  {
    title:       'Collaborative Learning',
    caption:     'Students working together on a group project, building real-world applications.',
    category:    'Students',
    imageUrl:    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
  },
  {
    title:       'Student Coding Session',
    caption:     'A student focused on solving a complex programming challenge.',
    category:    'Students',
    imageUrl:    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
  },
  {
    title:       'Female Student in Tech',
    caption:     'Empowering women in technology — one of our star students at work.',
    category:    'Students',
    imageUrl:    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
  },
  {
    title:       'Student Presentation',
    caption:     'Students presenting their final project to instructors and peers.',
    category:    'Students',
    imageUrl:    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  },
  // Instructors teaching
  {
    title:       'Instructor Teaching',
    caption:     'Our experienced instructor guiding students through advanced web development concepts.',
    category:    'Instructors',
    imageUrl:    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80',
  },
  {
    title:       'Classroom Lecture',
    caption:     'An engaging classroom session covering cybersecurity fundamentals.',
    category:    'Instructors',
    imageUrl:    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  },
  {
    title:       'One-on-One Mentoring',
    caption:     'Personalized mentoring — our instructors give individual attention to every student.',
    category:    'Instructors',
    imageUrl:    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80',
  },
  // Campus / facilities
  {
    title:       'Modern Computer Lab',
    caption:     'State-of-the-art computer lab equipped with the latest development tools.',
    category:    'Campus',
    imageUrl:    'https://images.unsplash.com/photo-1527430253228-e93688616381?w=800&q=80',
  },
  {
    title:       'Graduation Ceremony',
    caption:     'Celebrating our graduates — proud moments from our last graduation ceremony.',
    category:    'Events',
    imageUrl:    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
  },
  {
    title:       'Hackathon Event',
    caption:     'Students competing in our annual 24-hour hackathon challenge.',
    category:    'Events',
    imageUrl:    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
  },
  {
    title:       'Certificate Award Ceremony',
    caption:     'Certificates awarded to our outstanding graduates at the end of the programme.',
    category:    'Events',
    imageUrl:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
];

async function seedGallery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Run node createAdmin.js first.');
      process.exit(1);
    }

    // Clear existing gallery
    await GalleryItem.deleteMany({});
    console.log('🗑️  Cleared existing gallery');

    // Insert new images
    const items = galleryImages.map((img) => ({
      ...img,
      uploadedBy: admin._id,
      isPublished: true,
    }));

    await GalleryItem.insertMany(items);
    console.log(`✅ Seeded ${items.length} gallery images`);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
  }
}

seedGallery();
