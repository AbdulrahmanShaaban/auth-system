import mongoose from "mongoose";

/**
 * connectDB - Establishes a connection to the MongoDB database.
 *
 * Uses the MONGO_URI from environment variables.
 * If the connection fails, the process exits with code 1
 * because the server cannot function without a database.
 */
const connectDB = async (): Promise<void> => {
  try {
    // Attempt to connect to MongoDB using the connection string from .env
    const conn = await mongoose.connect(process.env.MONGO_URI as string);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error and exit — the server can't run without a DB
    console.error(`❌ MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
