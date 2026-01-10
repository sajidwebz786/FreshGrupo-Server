require('dotenv').config();

async function checkPacks() {
  try {
    const models = require('./models/index');
    const sequelize = models.sequelize;
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if Packs table exists
    const [results] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'Packs'
    `);

    if (results.length > 0) {
      console.log('Packs table exists.');

      // Check count
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM "Packs"');
      console.log(`Number of packs: ${count[0].count}`);

      if (count[0].count > 0) {
        const [packs] = await sequelize.query('SELECT id, name, "categoryId" FROM "Packs" LIMIT 10');
        console.log('Sample packs:', packs);
      }
    } else {
      console.log('Packs table does not exist.');
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPacks();