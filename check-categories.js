require('dotenv').config();

async function checkCategories() {
  try {
    // Load models (this will initialize the database connection)
    const models = require('./models/index');
    console.log('Models loaded.');

    const sequelize = models.sequelize;
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database
    await sequelize.sync();
    console.log('Database synced.');

    // Now check categories
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM "Categories"');
    console.log(`Number of categories in database: ${results[0].count}`);

    if (results[0].count > 0) {
      const [categories] = await sequelize.query('SELECT id, name, description FROM "Categories" ORDER BY id');
      console.log('Categories:');
      categories.forEach(cat => {
        console.log(`- ${cat.id}: ${cat.name} - ${cat.description}`);
      });
    } else {
      console.log('No categories found in the database.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCategories();