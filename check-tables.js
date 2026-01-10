require('dotenv').config();

async function checkTables() {
  try {
    const models = require('./models/index');
    const sequelize = models.sequelize;
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if Categories table exists
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'Categories'
    `);

    if (results.length > 0) {
      console.log('Categories table exists.');

      // Check count
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "Categories"');
      console.log(`Number of categories: ${count[0].count}`);

      if (count[0].count > 0) {
        const [categories] = await sequelize.query('SELECT id, name FROM "Categories" LIMIT 5');
        console.log('Sample categories:', categories);
      }
    } else {
      console.log('Categories table does not exist.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();