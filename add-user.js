require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');

async function addUser() {
  try {
    const email = 'sajids@gmail.com';
    const password = '333333333';

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: 'Sajid',
      email,
      password: hashedPassword,
      phone: null
    });

    console.log('User created successfully:', user.toJSON());
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    process.exit(0);
  }
}

addUser();