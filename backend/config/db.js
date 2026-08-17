const mongoose = require('mongoose');

const connectDB = async () => {
  const connStr = process.env.MONGO_URI;

  if (!connStr) {
    console.warn('⚠️ [MONGO] MONGO_URI is not defined in .env file!');
    return;
  }

  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 5000 });
    console.log(`\n========================================`);
    console.log(`🍃 MONGODB ATLAS CONNECTED: ${conn.connection.host}`);
    console.log(`   Database Name: "${conn.connection.name}"`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error(`\n========================================`);
    console.error(`❌ [MONGO CONNECTION ERROR] ${err.message}`);
    console.error(`👉 ATLAS TROUBLESHOOTING CHECKLIST:`);
    console.error(`   1. Database Access: Verify username '24aiml047_db_user' and password in Atlas.`);
    console.error(`   2. Network Access: Ensure your IP (or 0.0.0.0/0) is whitelisted in Atlas Network Access.`);
    console.error(`   3. Connection String: Ensure special characters in password are URL encoded.`);
    console.error(`========================================\n`);
  }
};

module.exports = connectDB;
