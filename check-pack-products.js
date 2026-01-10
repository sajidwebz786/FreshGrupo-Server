require('dotenv').config();

async function checkPackProducts() {
  try {
    const models = require('./models/index');
    const sequelize = models.sequelize;
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if PackProducts table exists
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'PackProducts'
    `);

    if (results.length > 0) {
      console.log('PackProducts table exists.');

      // Check count
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "PackProducts"');
      console.log(`Number of pack-product associations: ${count[0].count}`);

      if (count[0].count > 0) {
        const [associations] = await sequelize.query('SELECT "packId", "productId", quantity, "unitPrice" FROM "PackProducts" LIMIT 10');
        console.log('Sample pack-product associations:', associations);
      }
    } else {
      console.log('PackProducts table does not exist.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPackProducts();