import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'docsigns' });
  console.log('Connected!');

  const documentsCollection = mongoose.connection.db.collection('documents');
  const doc = await documentsCollection.findOne({ _id: new mongoose.Types.ObjectId('6a33a466c57780c43675b9e3') });

  if (!doc) {
    console.log('Document not found!');
    await mongoose.disconnect();
    return;
  }

  // Parse version from URL if possible
  // URL: https://res.cloudinary.com/dfocsc6zm/image/upload/v1781769317/wx54mw0rfsxzpjvcoovq.pdf
  const match = doc.cloudinaryUrl.match(/\/v(\d+)\//);
  const version = match ? match[1] : undefined;
  console.log('Parsed Version:', version);

  const signedUrl = cloudinary.url(doc.cloudinaryPublicId, {
    secure: true,
    resource_type: 'image',
    format: 'pdf',
    version: version,
    sign_url: true,
  });

  console.log('Generated Signed URL with Version:', signedUrl);

  console.log('Fetching...');
  const response = await fetch(signedUrl);
  console.log('Status:', response.status);
  console.log('x-cld-error:', response.headers.get('x-cld-error'));
  if (response.ok) {
    console.log('Success! Bytes:', (await response.arrayBuffer()).byteLength);
  }

  await mongoose.disconnect();
}

main().catch(err => console.error(err));
