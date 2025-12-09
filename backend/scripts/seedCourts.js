const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Court = require('../models/Court');

dotenv.config();

const courts = [
  { name: 'Court 1', sport: 'badminton' },
  { name: 'Court 2', sport: 'badminton' },
  { name: 'Court 3', sport: 'badminton' },
  { name: 'Table 1', sport: 'table-tennis' },
  { name: 'Table 2', sport: 'table-tennis' },
  { name: 'Table 3', sport: 'table-tennis' },
];

const seedCourts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sporthall');
    console.log('MongoDB connected');

    // Clear existing courts
    await Court.deleteMany({});
    console.log('Cleared existing courts');

    // Insert new courts
    const createdCourts = await Court.insertMany(courts);
    console.log(`Created ${createdCourts.length} courts:`);
    createdCourts.forEach(court => {
      console.log(`  - ${court.name} (${court.sport})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding courts:', error);
    process.exit(1);
  }
};

seedCourts();

