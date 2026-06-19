import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'docsigns' });
    console.log('Connected successfully.');

    const documentsCollection = mongoose.connection.db.collection('documents');
    const doc = await documentsCollection.findOne({ _id: new mongoose.Types.ObjectId('6a34d2594e63cbeadf49714b') });

    if (!doc) {
      console.log('Document not found.');
      await mongoose.disconnect();
      return;
    }

    console.log('Document:', doc);
    
    const usersCollection = mongoose.connection.db.collection('users');
    const user = await usersCollection.findOne({ _id: doc.uploadedBy });
    console.log('User Owner:', user);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

main();
