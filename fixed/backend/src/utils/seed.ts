import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Flight } from '../models/Flight';
import { User } from '../models/User';

dotenv.config();

const sampleFlights = [
  {
    airline: 'South African Airways',
    flightNumber: 'SA234',
    origin: { city: 'Cape Town', airport: 'Cape Town International', code: 'CPT' },
    destination: { city: 'Johannesburg', airport: 'OR Tambo International', code: 'JNB' },
    departure: { date: new Date('2026-03-15'), time: '08:00' },
    arrival: { date: new Date('2026-03-15'), time: '10:15' },
    duration: '2h 15m',
    price: 1500,
    availableSeats: 120,
    class: 'economy',
    amenities: ['WiFi', 'In-flight Entertainment', 'Meals'],
    stops: 0
  },
  {
    airline: 'Emirates',
    flightNumber: 'EK771',
    origin: { city: 'Cape Town', airport: 'Cape Town International', code: 'CPT' },
    destination: { city: 'Dubai', airport: 'Dubai International', code: 'DXB' },
    departure: { date: new Date('2026-03-20'), time: '19:35' },
    arrival: { date: new Date('2026-03-21'), time: '07:30' },
    duration: '9h 55m',
    price: 8500,
    availableSeats: 180,
    class: 'economy',
    amenities: ['WiFi', 'In-flight Entertainment', 'Meals', 'Power Outlets'],
    stops: 0
  },
  {
    airline: 'British Airways',
    flightNumber: 'BA058',
    origin: { city: 'Cape Town', airport: 'Cape Town International', code: 'CPT' },
    destination: { city: 'London', airport: 'Heathrow', code: 'LHR' },
    departure: { date: new Date('2026-04-01'), time: '18:30' },
    arrival: { date: new Date('2026-04-02'), time: '06:20' },
    duration: '11h 50m',
    price: 12000,
    availableSeats: 200,
    class: 'economy',
    amenities: ['WiFi', 'In-flight Entertainment', 'Meals', 'Blankets'],
    stops: 0
  },
  {
    airline: 'Lufthansa',
    flightNumber: 'LH574',
    origin: { city: 'Cape Town', airport: 'Cape Town International', code: 'CPT' },
    destination: { city: 'Frankfurt', airport: 'Frankfurt Airport', code: 'FRA' },
    departure: { date: new Date('2026-03-25'), time: '20:00' },
    arrival: { date: new Date('2026-03-26'), time: '09:15' },
    duration: '11h 15m',
    price: 11500,
    availableSeats: 150,
    class: 'economy',
    amenities: ['WiFi', 'In-flight Entertainment', 'Meals'],
    stops: 0
  },
  {
    airline: 'FlySafair',
    flightNumber: 'FA220',
    origin: { city: 'Cape Town', airport: 'Cape Town International', code: 'CPT' },
    destination: { city: 'Durban', airport: 'King Shaka International', code: 'DUR' },
    departure: { date: new Date('2026-03-18'), time: '10:30' },
    arrival: { date: new Date('2026-03-18'), time: '12:45' },
    duration: '2h 15m',
    price: 1200,
    availableSeats: 90,
    class: 'economy',
    amenities: ['Snacks'],
    stops: 0
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/journeybook';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Flight.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create sample flights
    const flights = await Flight.insertMany(sampleFlights);
    console.log(`✅ Created ${flights.length} sample flights`);

    // Create demo user
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@journeybook.com',
      password: 'demo123',
      role: 'user'
    });
    console.log('✅ Created demo user (email: demo@journeybook.com, password: demo123)');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@journeybook.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Created admin user (email: admin@journeybook.com, password: admin123)');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('User: demo@journeybook.com / demo123');
    console.log('Admin: admin@journeybook.com / admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
