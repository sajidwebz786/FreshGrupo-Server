require('dotenv').config();

async function insertPacks() {
  try {
    const models = require('./models/index');
    const { Pack, PackType, Category } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    await models.sequelize.sync();
    console.log('Database synced.');

    // First, ensure pack types exist
    const packTypes = [
      { name: 'Weekly Pack', duration: 'weekly', basePrice: 2500.00 },
      { name: 'Bi-Weekly Pack', duration: 'bi-weekly', basePrice: 5000.00 },
      { name: 'Monthly Pack', duration: 'monthly', basePrice: 10000.00 }
    ];

    const existingPackTypes = await PackType.count();
    let packTypeRecords = [];
    if (existingPackTypes === 0) {
      packTypeRecords = await PackType.bulkCreate(packTypes);
      console.log('Pack types inserted.');
    } else {
      packTypeRecords = await PackType.findAll();
      console.log('Pack types already exist.');
    }

    // Get categories
    const categories = await Category.findAll();
    console.log(`Found ${categories.length} categories.`);

    const existingPacks = await Pack.count();
    if (existingPacks > 0) {
      console.log(`Packs already exist: ${existingPacks}`);
      return;
    }

    // Create packs for each category and pack type
    const packs = [];
    categories.forEach(category => {
      packTypeRecords.forEach(packType => {
        packs.push({
          name: `${category.name} ${packType.name}`,
          description: `${category.description} - ${packType.name}`,
          categoryId: category.id,
          packTypeId: packType.id,
          basePrice: packType.basePrice,
          finalPrice: packType.basePrice,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
      });
    });

    await Pack.bulkCreate(packs);
    console.log(`Inserted ${packs.length} packs.`);

    await models.sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

insertPacks();