import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'docsigns' });
    console.log('Connected successfully.');

    const usersCollection = mongoose.connection.db.collection('users');
    const user = await usersCollection.findOne({ email: 'roshi@gmail.com' });

    if (!user) {
      console.log('User not found.');
      await mongoose.disconnect();
      return;
    }

    console.log('Original User:', {
      _id: user._id,
      email: user.email,
      passwordHash: user.password
    });

    const newPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { password: hash } }
    );
    console.log('Password updated successfully to: Password123!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

main();
