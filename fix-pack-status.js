/**
 * FreshGrupo - Fix Pack Status
 * Run this to fix packs that have no isActive status
 */

const db = require('./models/index');

async function fixPackStatus() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Connected to database');

    const Pack = db.Pack;

    // Find packs with null or undefined isActive
    const nullStatusPacks = await Pack.findAll({
      where: {
        isActive: null
      }
    });

    console.log(`Found ${nullStatusPacks.length} packs with null isActive`);

    // Set them to true
    if (nullStatusPacks.length > 0) {
      await Pack.update(
        { isActive: true },
        { where: { isActive: null } }
      );
      console.log('✅ Fixed all null isActive packs');
    }

    // Also check for undefined/missing (where the column might not exist or default wasn't applied)
    const allPacks = await Pack.findAll({ attributes: ['id', 'name', 'isActive'] });
    console.log('\n📋 All Packs Status:');
    allPacks.forEach(p => console.log(`  ID ${p.id}: ${p.name} - isActive: ${p.isActive}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPackStatus();