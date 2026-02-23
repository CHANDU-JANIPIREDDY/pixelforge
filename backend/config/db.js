import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 6+ no longer requires these options, but keeping for clarity
      // They are now defaults
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // Exit process with failure code (1 = error, 0 = success)
    process.exit(1);
  }
};

export default connectDB;
