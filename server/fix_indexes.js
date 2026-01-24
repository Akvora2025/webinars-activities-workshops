import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

const fixIndexes = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const certificateCollection = collections.find(c => c.name === 'certificates');

        if (certificateCollection) {
            console.log('Found certificates collection. Dropping indexes...');
            await mongoose.connection.db.collection('certificates').dropIndexes();
            console.log('Indexes dropped successfully.');
        } else {
            console.log('Certificates collection not found.');
        }

        console.log('Checking Users collection for cleanup (optional)...');
        // Optional: Ensure Users don't have bad indexes if needed, but Certificates is the main target.

        console.log('Done. Disconnecting...');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
