/**
 * Seed script to reset the database (except users) and seed only categories + products.
 *
 * This script will:
 *  1) Drop and recreate all tables except the User table (to preserve logins)
 *  2) Seed UnitTypes, Categories, and Products
 *  3) Leave Pack, PackType, PackProduct empty so the admin can create packs manually
 *
 * Run with: node seed-categories-products.js
 */

require('dotenv').config();
const db = require('./models');

async function resetAndSeedCategoriesProducts() {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Drop & recreate everything except Users so auth stays intact.
    // We use raw DROP TABLE ... CASCADE to ensure foreign keys do not block us.
    const tablesToDrop = [
      'DeleteRequests',
      'WalletTransactions',
      'Notifications',
      'OrderPackContents',
      'Orders',
      'CartItems',
      'Carts',
      'Addresses',
      'Payments',
      'CreditPackages',
      'RewardConfigs',
      'PackProducts',
      'Packs',
      'PackTypes',
      'Products',
      'Categories',
      'UnitTypes',
      'Wallets'
    ];

    console.log('\n🧹 Dropping tables (except Users)...');
    for (const table of tablesToDrop) {
      await db.sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`).catch((e) => {
        console.log(`  (skipping ${table}: ${e.message})`);
      });
      console.log(`  ✓ Dropped ${table}`);
    }

    console.log('\n📦 Recreating tables via Sequelize sync...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Tables recreated.');

    // Seed only categories/products (and unit types used by products)
    console.log('\n📦 Seeding unit types...');
    const unitTypes = [
      { name: 'Kilogram', abbreviation: 'KG', description: 'Weight in kilograms' },
      { name: 'Gram', abbreviation: 'G', description: 'Weight in grams' },
      { name: 'Piece', abbreviation: 'PC', description: 'Individual pieces' },
      { name: '500 Grams', abbreviation: '500G', description: '500 grams pack' },
      { name: '1 Kg', abbreviation: '1KG', description: '1 kilogram pack' },
      { name: 'Bottle', abbreviation: 'BTL', description: 'Bottled items' },
      { name: 'Pack', abbreviation: 'PKT', description: 'Packed items' },
      { name: 'Liter', abbreviation: 'L', description: 'Liquid in liters' },
      { name: 'Dozen', abbreviation: 'DZ', description: '12 pieces' }
    ];
    await db.UnitType.bulkCreate(unitTypes);
    console.log('✅ Unit types created.');

    console.log('\n📦 Seeding categories...');
    const categories = [
      { name: 'Fruits Pack', description: 'Fresh fruits and seasonal produce - Premium quality fruits delivered to your doorstep', image: 'fruits-pack.jpg' },
      { name: 'Vegetables Pack', description: 'Fresh vegetables and greens - Farm fresh vegetables for your family', image: 'vegetables-pack.jpg' },
      { name: 'Grocery Pack', description: 'Essential grocery items and staples - Complete kitchen essentials', image: 'grocery-pack.jpg' },
      { name: 'Juices Pack', description: 'Fresh fruit juices and beverages - Healthy and refreshing drinks', image: 'juices-pack.jpg' },
      { name: 'Millets Pack', description: 'Healthy millets and grains - Nutritious traditional grains', image: 'millets-pack.jpg' },
      { name: 'Raw Powder Pack', description: 'Raw spices and powder ingredients - Authentic ground spices', image: 'raw-powder-pack.jpg' },
      { name: 'Nutrition Pack', description: 'Nutritional supplements and health products - Complete wellness solutions', image: 'nutrition-pack.jpg' },
      { name: 'Dry Fruit Pack', description: 'Dried fruits and nuts - Premium quality dry fruits', image: 'dry-fruit-pack.jpg' },
      { name: 'Festival Pack', description: 'Festival special items and sweets - Celebrate with premium gifts', image: 'festival-pack.jpg' },
      { name: 'Flower Pack', description: 'Fresh flowers and bouquets - Beautiful flowers for every occasion', image: 'flower-pack.jpg' },
      { name: 'Sprouts Pack', description: 'Fresh sprouts and microgreens - Protein-rich healthy sprouts', image: 'sprouts-pack.jpg' }
    ];
    await db.Category.bulkCreate(categories);
    console.log('✅ Categories created.');

    // Fetch unit types for product references
    const kgUnit = await db.UnitType.findOne({ where: { abbreviation: 'KG' } });
    const dozenUnit = await db.UnitType.findOne({ where: { abbreviation: 'DZ' } });
    const pieceUnit = await db.UnitType.findOne({ where: { abbreviation: 'PC' } });
    const g500Unit = await db.UnitType.findOne({ where: { abbreviation: '500G' } });
    const literUnit = await db.UnitType.findOne({ where: { abbreviation: 'L' } });
    const packUnit = await db.UnitType.findOne({ where: { abbreviation: 'PKT' } });

    console.log('\n📦 Seeding products (only categories + products)...');

    const fruitProducts = [
      { name: 'Apple', description: 'Crisp and juicy apples - Premium quality', price: 180.0, image: 'apple.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 },
      { name: 'Banana', description: 'Sweet and ripe bananas', price: 50.0, image: 'banana.png', categoryId: 1, unitTypeId: dozenUnit.id, quantity: 1, stock: 200 },
      { name: 'Orange', description: 'Sweet and tangy oranges', price: 80.0, image: 'orange.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 150 },
      { name: 'Sweet Lime', description: 'Fresh sweet lime (Mosambi)', price: 70.0, image: 'sweetlime.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 120 },
      { name: 'Pomegranate', description: 'Premium quality pomegranate', price: 160.0, image: 'pomegranate.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Papaya', description: 'Ripe and sweet papaya', price: 50.0, image: 'papaya.png', categoryId: 1, unitTypeId: pieceUnit.id, quantity: 1, stock: 100 },
      { name: 'Guava', description: 'Fresh and crispy guava', price: 70.0, image: 'guava.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 90 },
      { name: 'Grapes', description: 'Seedless green/red grapes', price: 90.0, image: 'grapes.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 },
      { name: 'Mango', description: 'Seasonal alphonso/sweet mango', price: 120.0, image: 'mango.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 1, stock: 150 },
      { name: 'Sapota', description: 'Sweet sapota (Chikoo)', price: 60.0, image: 'sapota.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Watermelon', description: 'Fresh watermelon pieces', price: 30.0, image: 'watermelon.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Seasonal Fruit', description: 'Seasonal special fruit (varies)', price: 80.0, image: 'seasonal-fruit.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 }
    ];

    const vegetableProducts = [
      { name: 'Tomato', description: 'Fresh red tomatoes', price: 40.0, image: 'tomato.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 1, stock: 200 },
      { name: 'Potato', description: 'Fresh potatoes', price: 30.0, image: 'potato.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 1, stock: 300 },
      { name: 'Onion', description: 'Fresh onions', price: 40.0, image: 'onion.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 1, stock: 250 },
      { name: 'Carrot', description: 'Fresh orange carrots', price: 60.0, image: 'carrot.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.5, stock: 150 },
      { name: 'Cabbage', description: 'Fresh green cabbage', price: 40.0, image: 'cabbage.png', categoryId: 2, unitTypeId: pieceUnit.id, quantity: 1, stock: 120 },
      { name: 'Cauliflower', description: 'Fresh white cauliflower', price: 50.0, image: 'cauliflower.png', categoryId: 2, unitTypeId: pieceUnit.id, quantity: 1, stock: 100 },
      { name: 'Spinach', description: 'Fresh green spinach (Palak)', price: 30.0, image: 'spinach.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 100 },
      { name: 'Fenugreek Leaves', description: 'Fresh methi leaves', price: 25.0, image: 'fenugreek.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 80 },
      { name: 'Green Chili', description: 'Fresh green chilies', price: 80.0, image: 'green-chili.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 150 },
      { name: 'Ginger', description: 'Fresh ginger', price: 120.0, image: 'ginger.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 100 },
      { name: 'Garlic', description: 'Fresh garlic bulbs', price: 100.0, image: 'garlic.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 120 },
      { name: 'Coriander', description: 'Fresh coriander leaves', price: 20.0, image: 'coriander.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.1, stock: 100 },
      { name: 'Beans', description: 'Fresh green beans', price: 60.0, image: 'beans.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Peas', description: 'Fresh green peas', price: 80.0, image: 'peas.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 70 },
      { name: 'Capsicum', description: 'Fresh capsicum (Green/Red/Yellow)', price: 80.0, image: 'capsicum.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 80 },
      { name: 'Cucumber', description: 'Fresh cucumber', price: 30.0, image: 'cucumber.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 },
      { name: 'Bottle Gourd', description: 'Fresh lauki/doodhi', price: 40.0, image: 'bottle-gourd.png', categoryId: 2, unitTypeId: pieceUnit.id, quantity: 1, stock: 60 },
      { name: 'Bitter Gourd', description: 'Fresh karela', price: 60.0, image: 'bitter-gourd.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 50 }
    ];

    // For the remaining categories we only seed representative products to keep it clean.
    const groceryProducts = [
      { name: 'Basmati Rice', description: 'Premium quality basmati rice', price: 350.0, image: 'basmati-rice.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 5, stock: 100 },
      { name: 'Toor Dal', description: 'Pure toor/arhar dal', price: 220.0, image: 'toor-dal.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 150 },
      { name: 'Refined Oil', description: 'Pure refined cooking oil', price: 850.0, image: 'refined-oil.png', categoryId: 3, unitTypeId: literUnit.id, quantity: 5, stock: 150 }
    ];

    const juiceProducts = [
      { name: 'Orange Juice', description: 'Fresh orange juice (1L)', price: 150.0, image: 'orange-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 100 },
      { name: 'Apple Juice', description: 'Pure apple juice (1L)', price: 140.0, image: 'apple-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 100 },
      { name: 'Mango Juice', description: 'Alphonso mango juice (1L)', price: 180.0, image: 'mango-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 80 }
    ];

    const milletProducts = [
      { name: 'Ragi', description: 'Nutritious ragi millet', price: 120.0, image: 'ragi.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Jowar', description: 'Healthy jowar millet', price: 110.0, image: 'jowar.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Bajra', description: 'Rich bajra millet', price: 100.0, image: 'bajra.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 80 }
    ];

    const rawPowderProducts = [
      { name: 'Turmeric Powder', description: 'Pure turmeric powder', price: 450.0, image: 'turmeric-powder.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 150 },
      { name: 'Red Chili Powder', description: 'Kashmiri red chili powder', price: 400.0, image: 'chili-powder.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 120 },
      { name: 'Coriander Powder', description: 'Fresh coriander powder', price: 280.0, image: 'coriander-powder.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 100 }
    ];

    const nutritionProducts = [
      { name: 'Mixed Nuts', description: 'Healthy mixed nuts pack', price: 450.0, image: 'mixed-nuts.png', categoryId: 7, unitTypeId: kgUnit.id, quantity: 0.5, stock: 120 },
      { name: 'Trail Mix', description: 'Fruits + nuts trail mix', price: 399.0, image: 'trail-mix.png', categoryId: 7, unitTypeId: kgUnit.id, quantity: 0.5, stock: 120 },
      { name: 'Protein Bars', description: 'Energy protein bars', price: 150.0, image: 'protein-bars.png', categoryId: 7, unitTypeId: packUnit?.id, quantity: 1, stock: 150 }
    ];

    const dryFruitProducts = [
      { name: 'Almonds', description: 'Premium almonds', price: 850.0, image: 'almonds.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 0.25, stock: 120 },
      { name: 'Cashews', description: 'Creamy cashews', price: 950.0, image: 'cashews.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 0.25, stock: 120 },
      { name: 'Raisins', description: 'Sweet raisins', price: 240.0, image: 'raisins.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 0.25, stock: 120 }
    ];

    const festivalProducts = [
      { name: 'Assorted Sweets', description: 'Festival sweet box', price: 499.0, image: 'sweets.png', categoryId: 9, unitTypeId: packUnit?.id, quantity: 1, stock: 150 },
      { name: 'Ghee Soan Papdi', description: 'Traditional soan papdi', price: 299.0, image: 'soan-papdi.png', categoryId: 9, unitTypeId: packUnit?.id, quantity: 1, stock: 120 },
      { name: 'Dry Fruit Gift Box', description: 'Premium festival box', price: 1299.0, image: 'dry-fruit-box.png', categoryId: 9, unitTypeId: packUnit?.id, quantity: 1, stock: 80 }
    ];

    const flowerProducts = [
      { name: 'Rose Bouquet', description: 'Fresh rose bouquet', price: 299.0, image: 'rose-bouquet.png', categoryId: 10, unitTypeId: packUnit?.id, quantity: 1, stock: 100 },
      { name: 'Marigold Garland', description: 'Fresh marigold garland', price: 199.0, image: 'marigold-garland.png', categoryId: 10, unitTypeId: packUnit?.id, quantity: 1, stock: 90 },
      { name: 'Mixed Flowers', description: 'Mixed seasonal flowers', price: 249.0, image: 'mixed-flowers.png', categoryId: 10, unitTypeId: packUnit?.id, quantity: 1, stock: 80 }
    ];

    const sproutsProducts = [
      { name: 'Moong Sprouts', description: 'Fresh moong sprouts', price: 60.0, image: 'moong-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 80 },
      { name: 'Alfalfa Sprouts', description: 'Fresh alfalfa sprouts', price: 80.0, image: 'alfalfa-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.25, stock: 60 },
      { name: 'Mixed Sprouts', description: 'Assorted sprouts mix', price: 85.0, image: 'mixed-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 }
    ];

    // Bulk create all products
    await db.Product.bulkCreate([
      ...fruitProducts,
      ...vegetableProducts,
      ...groceryProducts,
      ...juiceProducts,
      ...milletProducts,
      ...rawPowderProducts,
      ...nutritionProducts,
      ...dryFruitProducts,
      ...festivalProducts,
      ...flowerProducts,
      ...sproutsProducts
    ]);

    console.log('✅ Products seeded.');

    console.log('\n✅ Database reset complete (categories + products only).');
    await db.sequelize.close();
    console.log('🔌 Connection closed.');
  } catch (error) {
    console.error('❌ Error during reset:', error);
    throw error;
  }
}

module.exports = {
  resetAndSeedCategoriesProducts,
};

// If run directly, execute immediately
if (require.main === module) {
  resetAndSeedCategoriesProducts().catch(() => process.exit(1));
}
