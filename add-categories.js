/**
 * FreshGrupo - Add Categories and UnitTypes First
 */

require('dotenv').config();
const db = require('./models');

async function addCategories() {
  try {
    console.log('🔌 Connecting...');
    await db.sequelize.authenticate();

    // Create Unit Types first
    console.log('📦 Creating unit types...');
    const unitTypes = [
      { name: 'Kilogram', abbreviation: 'KG' },
      { name: 'Gram', abbreviation: 'G' },
      { name: 'Piece', abbreviation: 'PC' },
      { name: '500 Grams', abbreviation: '500G' },
      { name: 'Bottle', abbreviation: 'BTL' },
      { name: 'Pack', abbreviation: 'PKT' },
      { name: 'Liter', abbreviation: 'L' },
      { name: 'Dozen', abbreviation: 'DZ' }
    ];
    
    // Delete existing and recreate
    await db.UnitType.destroy({ where: {} });
    await db.UnitType.bulkCreate(unitTypes);
    console.log('✅ Unit types created');

    // Create 11 Categories
    console.log('📦 Creating categories...');
    const categories = [
      { name: 'Fruits Pack', description: 'Fresh fruits and seasonal produce', image: 'fruits-pack.jpg' },
      { name: 'Vegetables Pack', description: 'Fresh vegetables and greens', image: 'vegetables-pack.jpg' },
      { name: 'Grocery Pack', description: 'Essential grocery items and staples', image: 'grocery-pack.jpg' },
      { name: 'Juices Pack', description: 'Fresh fruit juices and beverages', image: 'juices-pack.jpg' },
      { name: 'Millets Pack', description: 'Healthy millets and grains', image: 'millets-pack.jpg' },
      { name: 'Raw Powder Pack', description: 'Raw spices and powder ingredients', image: 'raw-powder-pack.jpg' },
      { name: 'Nutrition Pack', description: 'Nutritional supplements and health products', image: 'nutrition-pack.jpg' },
      { name: 'Dry Fruit Pack', description: 'Dried fruits and nuts', image: 'dry-fruit-pack.jpg' },
      { name: 'Festival Pack', description: 'Festival special items and sweets', image: 'festival-pack.jpg' },
      { name: 'Flower Pack', description: 'Fresh flowers and bouquets', image: 'flower-pack.jpg' },
      { name: 'Sprouts Pack', description: 'Fresh sprouts and microgreens', image: 'sprouts-pack.jpg' }
    ];

    // Delete existing and recreate
    await db.Category.destroy({ where: {} });
    await db.Category.bulkCreate(categories);
    console.log('✅ 11 Categories created');

    console.log('\n=============================================');
    console.log('✅ CATEGORIES AND UNIT TYPES CREATED!');
    console.log('=============================================');

    // Verify
    const catCount = await db.Category.count();
    const unitCount = await db.UnitType.count();
    console.log(`Categories: ${catCount}`);
    console.log(`Unit Types: ${unitCount}`);

    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addCategories();
