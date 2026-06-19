import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'docsigns' });
    console.log('Connected successfully.');

    const usersCollection = mongoose.connection.db.collection('users');
    const originalHash = '$2b$10$WjCOs3hPLe9wVFFQrbeZIuJgo7uGp1B7yQsFIs91S8b1Eg.OHf9Hq';

    await usersCollection.updateOne(
      { email: 'roshi@gmail.com' },
      { $set: { password: originalHash } }
    );
    console.log('Password hash successfully restored.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

main();
