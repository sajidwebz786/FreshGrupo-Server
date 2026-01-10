require('dotenv').config();

async function checkProducts() {
  try {
    const models = require('./models/index');
    const sequelize = models.sequelize;
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if Products table exists
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'Products'
    `);

    if (results.length > 0) {
      console.log('Products table exists.');

      // Check count
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "Products"');
      console.log(`Number of products: ${count[0].count}`);

      if (count[0].count > 0) {
        const [products] = await sequelize.query('SELECT id, name, "categoryId" FROM "Products" LIMIT 10');
        console.log('Sample products:', products);
      }
    } else {
      console.log('Products table does not exist.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();