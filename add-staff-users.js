require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');

const staffUsers = [
  {
    name: 'Staff User 1',
    email: 'staff1@freshgrupo.com',
    password: 'staff123',
    phone: '9876543210',
    role: 'staff'
  },
  {
    name: 'Staff User 2',
    email: 'staff2@freshgrupo.com',
    password: 'staff123',
    phone: '9876543211',
    role: 'staff'
  },
  {
    name: 'Staff User 3',
    email: 'staff3@freshgrupo.com',
    password: 'staff123',
    phone: '9876543212',
    role: 'staff'
  }
];

async function createStaffUsers() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Wait for sequelize to be ready
    const db = require('./models');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Sync models (in case DeleteRequest model is new)
    await db.sequelize.sync({ alter: true });
    console.log('📦 Database synced.');
    
    for (const userData of staffUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, updating role to staff...`);
        existingUser.role = 'staff';
        existingUser.isActive = true;
        await existingUser.save();
        console.log(`✅ Updated user: ${userData.email}`);
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create user
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });
        
        console.log(`✅ Created staff user: ${user.email} (ID: ${user.id})`);
      }
    }
    
    console.log('\n🎉 All staff users created successfully!');
    console.log('\nStaff login credentials:');
    console.log('Email: staff1@freshgrupo.com | Password: staff123');
    console.log('Email: staff2@freshgrupo.com | Password: staff123');
    console.log('Email: staff3@freshgrupo.com | Password: staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating staff users:', error);
    process.exit(1);
  }
}

createStaffUsers();
