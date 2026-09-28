const mongoose = require('../backend/node_modules/mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Create/update the dedicated demo administrator without clearing any existing data.
dotenv.config({ path: path.join(__dirname, '../backend/.env') });
const User = require('../backend/src/models/User');

async function setupAdmin() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_coin?directConnection=true';
  await mongoose.connect(mongoUri);

  const email = 'admin@gmail.com';
  const password = 'admin123';
  let admin = await User.findOne({ email });

  if (admin) {
    admin.name = 'Campus Coin Administrator';
    admin.password = password;
    admin.role = 'admin';
    admin.status = 'active';
    await admin.save();
    console.log('Admin account updated successfully.');
  } else {
    admin = await User.create({
      name: 'Campus Coin Administrator',
      email,
      password,
      role: 'admin',
      status: 'active'
    });
    console.log('Admin account created successfully.');
  }

  console.log('Admin Login: admin@gmail.com / admin123');
  await mongoose.disconnect();
}

setupAdmin().catch(async (error) => {
  console.error('[Admin Setup Error]', error.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
