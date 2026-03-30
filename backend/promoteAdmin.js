import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model.js';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

async function main() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI missing');

    await mongoose.connect(uri);
    console.log('Connected to DB');

    const identifier = process.argv[2];
    if (!identifier) {
      console.log('Usage: node promoteAdmin.js <username_or_email>');
      process.exit(1);
    }

    console.log(`Searching for: ${identifier}`);

    // Search by both email and username (case insensitive)
    const user = await User.findOne({
      $or: [
        { email: new RegExp(`^${identifier}$`, 'i') },
        { username: new RegExp(`^${identifier}$`, 'i') }
      ]
    });

    if (!user) {
      console.log('User not found. Current users:');
      const all = await User.find({}, 'username email role');
      all.forEach(u => console.log(` - ${u.username} (${u.email})`));
    } else {
      user.role = 'Admin';
      await user.save();
      console.log(`SUCCESS: ${user.username} is now Admin`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

main();
