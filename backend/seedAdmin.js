import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Get directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env') });

// Admin user credentials
const ADMIN_USER = {
  name: 'Admin',
  email: 'admin@pixelforge.com',
  password: 'Admin@123',
  role: 'Admin',
};

/**
 * Seed script to create the first admin user
 */
const seedAdmin = async () => {
  let connection;

  try {
    // Validate required environment variables
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email.toLowerCase() });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user (password hashed by pre-save hook)
    console.log('Creating admin user...');
    const admin = await User.create(ADMIN_USER);

    console.log('✓ Admin created successfully!');
    console.log('');
    console.log('Credentials:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${ADMIN_USER.password}`);
    console.log('');
    console.log('⚠️  Change the password after first login!');

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    if (connection) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedAdmin();
