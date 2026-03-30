import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './backend/models/user.model.js';

dotenv.config();

const promoteToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'Admin' },
      { new: true }
    );

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`User ${user.username} (${user.email}) has been promoted to Admin.`);
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Please provide a user email: node promoteAdmin.js user@example.com');
  process.exit(1);
}

promoteToAdmin(email);
