require('dotenv').config();
const db = require('./models');

async function updatePackTypes() {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models
    await db.sequelize.sync({ alter: true });
    console.log('📦 Database synced.');

    // Get all categories
    const categories = await db.Category.findAll();
    console.log('📋 Found categories:', categories.map(c => ({ id: c.id, name: c.name })));

    // Get all pack types
    const packTypes = await db.PackType.findAll();
    console.log('📋 Found pack types:', packTypes.map(pt => ({ id: pt.id, name: pt.name, categoryId: pt.categoryId })));

    // Get all packs
    const packs = await db.Pack.findAll({ include: [db.Category, db.PackType] });
    console.log('📋 Found packs:', packs.length);

    // Map categories to their pack types
    const categoryPackTypeMap = {};
    packTypes.forEach(pt => {
      if (pt.categoryId) {
        if (!categoryPackTypeMap[pt.categoryId]) {
          categoryPackTypeMap[pt.categoryId] = {};
        }
        categoryPackTypeMap[pt.categoryId][pt.duration] = pt.id;
      }
    });

    console.log('📋 Category to PackType mapping:', JSON.stringify(categoryPackTypeMap, null, 2));

    // Update each pack with the correct pack type based on its category
    let updatedCount = 0;
    for (const pack of packs) {
      const categoryId = pack.categoryId;
      const currentPackTypeId = pack.packTypeId;
      
      // Find the pack type for this category and duration
      let newPackTypeId = null;
      
      if (categoryPackTypeMap[categoryId]) {
        // Determine the duration based on pack name
        const packName = pack.name.toLowerCase();
        let duration = 'small';
        
        if (packName.includes('medium') || packName.includes('bi-weekly') || packName.includes('bi weekly')) {
          duration = 'medium';
        } else if (packName.includes('large') || packName.includes('monthly')) {
          duration = 'large';
        } else if (packName.includes('custom')) {
          duration = 'custom';
        }
        
        newPackTypeId = categoryPackTypeMap[categoryId][duration];
      }

      if (newPackTypeId && newPackTypeId !== currentPackTypeId) {
        console.log(`📝 Updating pack "${pack.name}" (ID: ${pack.id}) from packTypeId ${currentPackTypeId} to ${newPackTypeId}`);
        await db.Pack.update({ packTypeId: newPackTypeId }, { where: { id: pack.id } });
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} packs with correct pack types.`);

    // Show updated packs
    const updatedPacks = await db.Pack.findAll({ 
      include: [
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] },
        { model: db.PackType, as: 'PackType', attributes: ['id', 'name'] }
      ]
    });

    console.log('\n📋 Updated Packs:');
    updatedPacks.forEach(pack => {
      console.log(`  - ${pack.name} | Category: ${pack.Category?.name} | Pack Type: ${pack.PackType?.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updatePackTypes();
