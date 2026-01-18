import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Connect to MongoDB - same as server config
const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI.replace('localhost', '127.0.0.1');
        await mongoose.connect(`${uri}/Edemy`);
        console.log('MongoDB connected to Edemy database');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Import the actual User model
import User from '../models/User.js';

const createAdmin = async () => {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@learnhub.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('Admin user already exists, deleting and recreating...');
            await User.findByIdAndDelete(existingAdmin._id);
            console.log('Old admin deleted');
        }
        
        {
            // Create new admin user - password will be hashed by the model's pre-save hook
            const admin = new User({
                email: adminEmail,
                password: adminPassword,  // Will be hashed by pre-save hook
                firstName: 'Admin',
                lastName: 'LearnHub',
                role: 'admin',
                isVerified: true
            });

            await admin.save();
            console.log('Admin user created successfully!');
        }

        console.log('\n--- Admin Credentials ---');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('URL: http://localhost:5173/admin');
        console.log('-------------------------\n');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
};

createAdmin();
