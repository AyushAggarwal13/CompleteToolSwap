import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('\n MongoDB is not running or not accessible!');
    console.error('Please either:');
    console.error('1. Install and start MongoDB locally, OR');
    console.error('2. Use MongoDB Atlas (https://www.mongodb.com/cloud/atlas)');
    console.error('3. Update MONGO_URI in .env file\n');
    return false;
  }
};

export default connectDB;