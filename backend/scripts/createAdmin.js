// scripts/createAdmin.js — run manually once via `node scripts/createAdmin.js`, never expose as an API route
const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await User.findOne({ email: 'admin@naarzi.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  await User.create({
    name: 'Naarzi Admin',
    email: 'admin@naarzi.com', // change to real admin email before running
    password: 'admin123', // change to a strong password before running, then change it again after first login
    role: 'admin'
  });
  console.log('Admin created');
  process.exit(0);
}

createAdmin();
