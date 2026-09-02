const mongoose = require('mongoose');
const dns = require('dns');
const { env } = require('./env');

// Force Node.js to use public DNS servers to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('[db] MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };