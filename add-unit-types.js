/**
 * FreshGrupo - Add More Unit Types
 * Run this to add Half Dozen and other missing unit types
 */

const db = require('./models/index');

async function addUnitTypes() {
  try {
    // Initialize database
    await db.sequelize.authenticate();
    console.log('✅ Connected to database');

    const UnitType = db.UnitType;

    // Get existing unit types
    const existingTypes = await UnitType.findAll({ attributes: ['abbreviation'] });
    const existingAbbr = existingTypes.map(u => u.abbreviation.toUpperCase());
    console.log('Existing abbreviations:', existingAbbr);

    // New unit types to add
    const newUnitTypes = [
      { name: 'Half Dozen', abbreviation: 'HDZN', description: '6 pieces (Half Dozen)' },
      { name: '250 Grams', abbreviation: '250G', description: '250 grams pack' },
      { name: '100 Grams', abbreviation: '100G', description: '100 grams pack' },
      { name: '500 Milliliter', abbreviation: '500ML', description: '500 milliliter' },
      { name: '250 Milliliter', abbreviation: '250ML', description: '250 milliliter' },
      { name: '6 Pieces', abbreviation: '6PCS', description: '6 pieces' },
    ];

    let added = 0;
    for (const unit of newUnitTypes) {
      if (!existingAbbr.includes(unit.abbreviation.toUpperCase())) {
        await UnitType.create({
          name: unit.name,
          abbreviation: unit.abbreviation,
          description: unit.description,
          isActive: true
        });
        console.log(`✅ Added: ${unit.name} (${unit.abbreviation})`);
        added++;
      } else {
        console.log(`⏭️  Skipped (exists): ${unit.name} (${unit.abbreviation})`);
      }
    }

    console.log(`\n🎉 Done! Added ${added} new unit types.`);

    // Show all unit types now
    const allTypes = await UnitType.findAll({ attributes: ['id', 'name', 'abbreviation'], order: [['id', 'ASC']] });
    console.log('\n📋 All Unit Types:');
    allTypes.forEach(u => console.log(`  ${u.id}: ${u.name} (${u.abbreviation})`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUnitTypes();