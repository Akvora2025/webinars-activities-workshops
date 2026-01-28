import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import WorkshopRegistration from './models/WorkshopRegistration.js';
import Event from './models/Event.js';
import User from './models/User.js';

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

        // 1. WorkshopRegistration Indexes
        console.log('Syncing WorkshopRegistration indexes...');
        await WorkshopRegistration.syncIndexes();
        console.log('✓ WorkshopRegistration indexes synced.');

        // 2. Event Indexes (if any)
        console.log('Syncing Event indexes...');
        await Event.syncIndexes();
        console.log('✓ Event indexes synced.');

        // 3. User Indexes
        console.log('Syncing User indexes...');
        await User.syncIndexes();
        console.log('✓ User indexes synced.');

        console.log('--- Index Maintenance Complete ---');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
