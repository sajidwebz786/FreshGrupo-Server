require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./models');

async function createStaffUsers() {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    const staffUsers = [
      {
        name: 'Staff User 1',
        email: 'staff1@freshgrupo.com',
        phone: '9876543201',
        password: 'staff123',
        role: 'staff'
      },
      {
        name: 'Staff User 2',
        email: 'staff2@freshgrupo.com',
        phone: '9876543202',
        password: 'staff123',
        role: 'staff'
      },
      {
        name: 'Staff User 3',
        email: 'staff3@freshgrupo.com',
        phone: '9876543203',
        password: 'staff123',
        role: 'staff'
      }
    ];

    for (const staff of staffUsers) {
      // Check if user already exists
      const existingUser = await db.User.findOne({ where: { email: staff.email } });
      
      if (existingUser) {
        console.log(`⚠️  Staff user ${staff.email} already exists`);
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(staff.password, 10);
        
        // Create user
        const user = await db.User.create({
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          password: hashedPassword,
          role: staff.role,
          isActive: true
        });
        
        console.log(`✅ Created staff user: ${staff.email} (ID: ${user.id})`);
      }
    }

    console.log('\n📋 Staff login credentials:');
    console.log('  1. Email: staff1@freshgrupo.com | Password: staff123');
    console.log('  2. Email: staff2@freshgrupo.com | Password: staff123');
    console.log('  3. Email: staff3@freshgrupo.com | Password: staff123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createStaffUsers();
