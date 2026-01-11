require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');

async function addAdmin() {
  try {
    const email = 'admin@freshgrupo.com';
    const password = 'Welcome@919';

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({
      name: 'Admin User',
      email,
      password: hashedPassword,
      phone: '+1234567891',
      role: 'admin'
    });

    console.log('Admin user created successfully:', user.toJSON());
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit(0);
  }
}

addAdmin();