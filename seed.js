/**
 * FreshGrupo Database Seed Script
 * 
 * This script:
 * 1. Flushes all data from the database (except users)
 * 2. Creates 11 categories
 * 3. Creates products for all categories
 * 4. Creates pack types for each category
 * 5. Creates packs for all categories
 * 
 * Run with: node seed.js
 */

require('dotenv').config();
const db = require('./models');

async function flushAndSeed() {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models (skip if already synced - just ensure tables exist)
    console.log('📦 Checking database sync...');
    // Don't sync with alter - just ensure connection works
    // await db.sequelize.sync({ alter: true });
    console.log('✅ Database ready.');

    // ==============================
    // FLUSH ALL DATA EXCEPT USERS
    // ==============================
    console.log('\n🗑️  Flushing all data except users...\n');

    // Order matters due to foreign key constraints
    try { await db.DeleteRequest.destroy({ where: {}, truncate: true }); console.log('✓ Deleted DeleteRequests'); } catch (e) { console.log('  (DeleteRequests: table not found or empty)'); }
    try { await db.WalletTransaction.destroy({ where: {}, truncate: true }); console.log('✓ Deleted WalletTransactions'); } catch (e) { console.log('  (WalletTransactions: table not found or empty)'); }
    try { await db.Notification.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Notifications'); } catch (e) { console.log('  (Notifications: table not found or empty)'); }
    try { await db.OrderPackContent.destroy({ where: {}, truncate: true }); console.log('✓ Deleted OrderPackContents'); } catch (e) { console.log('  (OrderPackContents: table not found or empty)'); }
    try { await db.Order.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Orders'); } catch (e) { console.log('  (Orders: table not found or empty)'); }
    try { await db.CartItem.destroy({ where: {}, truncate: true }); console.log('✓ Deleted CartItems'); } catch (e) { console.log('  (CartItems: table not found or empty)'); }
    try { await db.Cart.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Carts'); } catch (e) { console.log('  (Carts: table not found or empty)'); }
    try { await db.Address.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Addresses'); } catch (e) { console.log('  (Addresses: table not found or empty)'); }
    try { await db.Payment.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Payments'); } catch (e) { console.log('  (Payments: table not found or empty)'); }
    try { await db.CreditPackage.destroy({ where: {}, truncate: true }); console.log('✓ Deleted CreditPackages'); } catch (e) { console.log('  (CreditPackages: table not found or empty)'); }
    try { await db.RewardConfig.destroy({ where: {}, truncate: true }); console.log('✓ Deleted RewardConfigs'); } catch (e) { console.log('  (RewardConfigs: table not found or empty)'); }
    try { await db.PackProduct.destroy({ where: {}, truncate: true }); console.log('✓ Deleted PackProducts'); } catch (e) { console.log('  (PackProducts: table not found or empty)'); }
    try { await db.Pack.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Packs'); } catch (e) { console.log('  (Packs: table not found or empty)'); }
    try { await db.PackType.destroy({ where: {}, truncate: true }); console.log('✓ Deleted PackTypes'); } catch (e) { console.log('  (PackTypes: table not found or empty)'); }
    try { await db.Product.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Products'); } catch (e) { console.log('  (Products: table not found or empty)'); }
    try { await db.Category.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Categories'); } catch (e) { console.log('  (Categories: table not found or empty)'); }
    try { await db.UnitType.destroy({ where: {}, truncate: true }); console.log('✓ Deleted UnitTypes'); } catch (e) { console.log('  (UnitTypes: table not found or empty)'); }
    try { await db.Wallet.destroy({ where: {}, truncate: true }); console.log('✓ Deleted Wallets'); } catch (e) { console.log('  (Wallets: table not found or empty)'); }

    // Reset auto-increment for all tables
    console.log('\n🔄 Resetting auto-increment counters...');
    for (const modelName of ['Category', 'Product', 'Pack', 'PackType', 'PackProduct', 'UnitType']) {
      if (db[modelName]) {
        await db.sequelize.query(`ALTER SEQUENCE "${modelName}s_id_seq" RESTART WITH 1;`).catch(() => {});
        console.log(`  ✓ Reset ${modelName}s`);
      }
    }

    console.log('\n✅ Database flushed successfully!\n');

    // ==============================
    // CREATE UNIT TYPES
    // ==============================
    console.log('📦 Creating unit types...');
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
    console.log('✅ Unit types created.\n');

    // ==============================
    // CREATE 11 CATEGORIES
    // ==============================
    console.log('📦 Creating categories...');
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
    console.log('✅ 11 Categories created.\n');

    // Get unit types for reference
    const kgUnit = await db.UnitType.findOne({ where: { abbreviation: 'KG' } });
    const gramUnit = await db.UnitType.findOne({ where: { abbreviation: 'G' } });
    const pieceUnit = await db.UnitType.findOne({ where: { abbreviation: 'PC' } });
    const g500Unit = await db.UnitType.findOne({ where: { abbreviation: '500G' } });
    const bottleUnit = await db.UnitType.findOne({ where: { abbreviation: 'BTL' } });
    const packUnit = await db.UnitType.findOne({ where: { abbreviation: 'PKT' } });
    const literUnit = await db.UnitType.findOne({ where: { abbreviation: 'L' } });
    const dozenUnit = await db.UnitType.findOne({ where: { abbreviation: 'DZ' } });

    // ==============================
    // CREATE PRODUCTS FOR EACH CATEGORY
    // ==============================
    console.log('📦 Creating products for each category...\n');

    // Fruits Pack Products (Category 1)
    const fruitProducts = [
      { name: 'Apple', description: 'Crisp and juicy apples - Premium quality', price: 180.00, image: 'apple.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 },
      { name: 'Banana', description: 'Sweet and ripe bananas', price: 50.00, image: 'banana.png', categoryId: 1, unitTypeId: dozenUnit.id, quantity: 1, stock: 200 },
      { name: 'Orange', description: 'Sweet and tangy oranges', price: 80.00, image: 'orange.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 150 },
      { name: 'Sweet Lime', description: 'Fresh sweet lime (Mosambi)', price: 70.00, image: 'sweetlime.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 120 },
      { name: 'Pomegranate', description: 'Premium quality pomegranate', price: 160.00, image: 'pomegranate.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Papaya', description: 'Ripe and sweet papaya', price: 50.00, image: 'papaya.png', categoryId: 1, unitTypeId: pieceUnit.id, quantity: 1, stock: 100 },
      { name: 'Guava', description: 'Fresh and crispy guava', price: 70.00, image: 'guava.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 90 },
      { name: 'Grapes', description: 'Seedless green/red grapes', price: 90.00, image: 'grapes.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 },
      { name: 'Mango', description: 'Seasonal alphonso/sweet mango', price: 120.00, image: 'mango.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 1, stock: 150 },
      { name: 'Sapota', description: 'Sweet sapota (Chikoo)', price: 60.00, image: 'sapota.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Watermelon', description: 'Fresh watermelon pieces', price: 30.00, image: 'watermelon.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Seasonal Fruit', description: 'Seasonal special fruit (varies)', price: 80.00, image: 'seasonal-fruit.png', categoryId: 1, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 }
    ];
    await db.Product.bulkCreate(fruitProducts);
    console.log('✅ Fruits Pack products created (12 products)');

    // Vegetables Pack Products (Category 2)
    const vegetableProducts = [
      { name: 'Tomato', description: 'Fresh red tomatoes', price: 40.00, image: 'tomato.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 1, stock: 200 },
      { name: 'Potato', description: 'Fresh potatoes', price: 30.00, image: 'potato.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 1, stock: 300 },
      { name: 'Onion', description: 'Fresh onions', price: 40.00, image: 'onion.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 1, stock: 250 },
      { name: 'Carrot', description: 'Fresh orange carrots', price: 60.00, image: 'carrot.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.5, stock: 150 },
      { name: 'Cabbage', description: 'Fresh green cabbage', price: 40.00, image: 'cabbage.png', categoryId: 2, unitTypeId: pieceUnit.id, quantity: 1, stock: 120 },
      { name: 'Cauliflower', description: 'Fresh white cauliflower', price: 50.00, image: 'cauliflower.png', categoryId: 2, unitTypeId: pieceUnit.id, quantity: 1, stock: 100 },
      { name: 'Spinach', description: 'Fresh green spinach (Palak)', price: 30.00, image: 'spinach.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 100 },
      { name: 'Fenugreek Leaves', description: 'Fresh methi leaves', price: 25.00, image: 'fenugreek.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 80 },
      { name: 'Green Chili', description: 'Fresh green chilies', price: 80.00, image: 'green-chili.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 150 },
      { name: 'Ginger', description: 'Fresh ginger', price: 120.00, image: 'ginger.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 100 },
      { name: 'Garlic', description: 'Fresh garlic bulbs', price: 100.00, image: 'garlic.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 120 },
      { name: 'Coriander', description: 'Fresh coriander leaves', price: 20.00, image: 'coriander.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.1, stock: 100 },
      { name: 'Beans', description: 'Fresh green beans', price: 60.00, image: 'beans.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Peas', description: 'Fresh green peas', price: 80.00, image: 'peas.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 70 },
      { name: 'Capsicum', description: 'Fresh capsicum (Green/Red/Yellow)', price: 80.00, image: 'capsicum.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 80 },
      { name: 'Cucumber', description: 'Fresh cucumber', price: 30.00, image: 'cucumber.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.5, stock: 100 },
      { name: 'Bottle Gourd', description: 'Fresh lauki/doodhi', price: 40.00, image: 'bottle-gourd.png', categoryId: 2, unitTypeId: pieceUnit.id, quantity: 1, stock: 60 },
      { name: 'Bitter Gourd', description: 'Fresh karela', price: 60.00, image: 'bitter-gourd.png', categoryId: 2, unitTypeId: kgUnit.id, quantity: 0.25, stock: 50 }
    ];
    await db.Product.bulkCreate(vegetableProducts);
    console.log('✅ Vegetables Pack products created (18 products)');

    // Grocery Pack Products (Category 3)
    const groceryProducts = [
      { name: 'Basmati Rice', description: 'Premium quality basmati rice', price: 350.00, image: 'basmati-rice.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 5, stock: 100 },
      { name: 'Idli Rice', description: 'Special idli rice for soft idlis', price: 180.00, image: 'idli-rice.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 5, stock: 80 },
      { name: 'Toor Dal', description: 'Pure toor/arhar dal', price: 220.00, image: 'toor-dal.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 150 },
      { name: 'Moong Dal', description: 'Split green gram dal', price: 200.00, image: 'moong-dal.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 120 },
      { name: 'Urad Dal', description: 'Black gram dal', price: 210.00, image: 'urad-dal.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Chana Dal', description: 'Split chickpeas', price: 180.00, image: 'chana-dal.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Atta (Wheat Flour)', description: 'Fresh whole wheat atta', price: 340.00, image: 'atta.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 10, stock: 200 },
      { name: 'Maida', description: 'Refined wheat flour', price: 280.00, image: 'maida.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Rava (Sooji)', description: 'Fine rava for upma', price: 180.00, image: 'rava.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 70 },
      { name: 'Refined Oil', description: 'Pure refined cooking oil', price: 850.00, image: 'refined-oil.png', categoryId: 3, unitTypeId: literUnit.id, quantity: 5, stock: 150 },
      { name: 'Groundnut Oil', description: 'Cold pressed groundnut oil', price: 450.00, image: 'groundnut-oil.png', categoryId: 3, unitTypeId: literUnit.id, quantity: 1, stock: 80 },
      { name: 'Ghee', description: 'Pure desi ghee', price: 1200.00, image: 'ghee.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 50 },
      { name: 'Sugar', description: 'Fine crystal sugar', price: 45.00, image: 'sugar.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 200 },
      { name: 'Jaggery', description: 'Organic jaggery', price: 120.00, image: 'jaggery.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Salt', description: 'Iodized fine salt', price: 25.00, image: 'salt.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 1, stock: 300 },
      { name: 'Turmeric Powder', description: 'Pure turmeric powder', price: 450.00, image: 'turmeric-powder.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.5, stock: 150 },
      { name: 'Red Chili Powder', description: 'Kashmiri red chili powder', price: 400.00, image: 'chili-powder.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.5, stock: 120 },
      { name: 'Coriander Powder', description: 'Fresh coriander powder', price: 280.00, image: 'coriander-powder.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.5, stock: 100 },
      { name: 'Cumin Seeds', description: 'Premium jeera', price: 350.00, image: 'cumin-seeds.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.25, stock: 100 },
      { name: 'Mustard Seeds', description: 'Rai/mustard seeds', price: 180.00, image: 'mustard-seeds.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.25, stock: 80 },
      { name: 'Asafoetida (Hing)', description: 'Pure hing powder', price: 200.00, image: 'hing.png', categoryId: 3, unitTypeId: gramUnit.id, quantity: 100, stock: 60 },
      { name: 'Curry Leaves', description: 'Fresh curry leaves', price: 40.00, image: 'curry-leaves.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.1, stock: 100 },
      { name: 'Tamarind', description: 'Raw tamarind', price: 120.00, image: 'tamarind.png', categoryId: 3, unitTypeId: kgUnit.id, quantity: 0.5, stock: 80 },
      { name: 'Black Pepper', description: 'Whole black pepper', price: 450.00, image: 'black-pepper.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.25, stock: 70 },
      { name: 'Cardamom', description: 'Green cardamom', price: 1200.00, image: 'cardamom.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.1, stock: 50 },
      { name: 'Cinnamon', description: 'Cinnamon sticks', price: 400.00, image: 'cinnamon.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.25, stock: 60 },
      { name: 'Cloves', description: 'Whole cloves', price: 500.00, image: 'cloves.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.25, stock: 60 },
      { name: 'Bay Leaves', description: 'Dried bay leaves', price: 180.00, image: 'bay-leaves.png', categoryId: 3, unitTypeId: g500Unit.id, quantity: 0.1, stock: 80 }
    ];
    await db.Product.bulkCreate(groceryProducts);
    console.log('✅ Grocery Pack products created (28 products)');

    // Juices Pack Products (Category 4)
    const juiceProducts = [
      { name: 'Orange Juice', description: 'Fresh orange juice (1L)', price: 150.00, image: 'orange-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 100 },
      { name: 'Apple Juice', description: 'Pure apple juice (1L)', price: 140.00, image: 'apple-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 100 },
      { name: 'Mango Juice', description: 'Alphonso mango juice (1L)', price: 180.00, image: 'mango-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 80 },
      { name: 'Grape Juice', description: 'Fresh grape juice (1L)', price: 130.00, image: 'grape-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 80 },
      { name: 'Pomegranate Juice', description: 'Pure pomegranate juice (1L)', price: 200.00, image: 'pomegranate-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 60 },
      { name: 'Sweet Lime Juice', description: 'Fresh mosambi juice (1L)', price: 100.00, image: 'sweetlime-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 80 },
      { name: 'Watermelon Juice', description: 'Fresh watermelon juice (1L)', price: 80.00, image: 'watermelon-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 70 },
      { name: 'Carrot Juice', description: 'Fresh carrot juice (1L)', price: 120.00, image: 'carrot-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 60 },
      { name: 'Beetroot Juice', description: 'Fresh beetroot juice (1L)', price: 130.00, image: 'beetroot-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 50 },
      { name: 'Green Juice', description: 'Detox green juice (1L)', price: 180.00, image: 'green-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 50 },
      { name: 'Mixed Fruit Juice', description: 'Assorted fruit juice (1L)', price: 140.00, image: 'mixed-fruit-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 80 },
      { name: 'Lemon Juice', description: 'Fresh lemon juice (1L)', price: 80.00, image: 'lemon-juice.png', categoryId: 4, unitTypeId: literUnit.id, quantity: 1, stock: 100 }
    ];
    await db.Product.bulkCreate(juiceProducts);
    console.log('✅ Juices Pack products created (12 products)');

    // Millets Pack Products (Category 5)
    const milletsProducts = [
      { name: 'Foxtail Millet', description: 'Healthy foxtail millet (1kg)', price: 120.00, image: 'foxtail-millet.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Little Millet', description: 'Nutritious little millet (1kg)', price: 110.00, image: 'little-millet.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Kodo Millet', description: 'Organic kodo millet (1kg)', price: 130.00, image: 'kodo-millet.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 70 },
      { name: 'Barnyard Millet', description: 'Protein-rich barnyard millet (1kg)', price: 140.00, image: 'barnyard-millet.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 70 },
      { name: 'Proso Millet', description: 'Light proso millet (1kg)', price: 100.00, image: 'proso-millet.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 60 },
      { name: 'Bajra', description: 'Pearl millet/bajra (1kg)', price: 80.00, image: 'bajra.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Jowar', description: 'Sorghum/jowar (1kg)', price: 90.00, image: 'jowar.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Ragi', description: 'Finger millet/ragi (1kg)', price: 100.00, image: 'ragi.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Korralu', description: 'Ancient korralu (1kg)', price: 150.00, image: 'korralu.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 50 },
      { name: 'Samai', description: 'Little millet variety (1kg)', price: 120.00, image: 'samai.png', categoryId: 5, unitTypeId: kgUnit.id, quantity: 1, stock: 60 }
    ];
    await db.Product.bulkCreate(milletsProducts);
    console.log('✅ Millets Pack products created (10 products)');

    // Raw Powder Pack Products (Category 6)
    const rawPowderProducts = [
      { name: 'Turmeric Powder', description: 'Organic turmeric powder (500g)', price: 250.00, image: 'turmeric-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 100 },
      { name: 'Red Chili Powder', description: 'Kashmiri red chili powder (500g)', price: 220.00, image: 'chili-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 100 },
      { name: 'Coriander Powder', description: 'Fresh coriander powder (500g)', price: 180.00, image: 'coriander-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 80 },
      { name: 'Cumin Powder', description: 'Roasted cumin powder (500g)', price: 250.00, image: 'cumin-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 },
      { name: 'Cinnamon Powder', description: 'Ground cinnamon (250g)', price: 200.00, image: 'cinnamon-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.25, stock: 60 },
      { name: 'Black Pepper Powder', description: 'Ground black pepper (250g)', price: 250.00, image: 'pepper-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.25, stock: 70 },
      { name: 'Ginger Powder', description: 'Dry ginger powder (500g)', price: 200.00, image: 'ginger-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Garlic Powder', description: 'Garlic granules (500g)', price: 180.00, image: 'garlic-raw.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Asafoetida (Hing)', description: 'Pure hing powder (100g)', price: 300.00, image: 'hing-raw.png', categoryId: 6, unitTypeId: gramUnit.id, quantity: 100, stock: 50 },
      { name: 'Rock Salt', description: 'Sendha namak (1kg)', price: 60.00, image: 'rock-salt.png', categoryId: 6, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Black Salt', description: 'Kala namak (500g)', price: 80.00, image: 'black-salt.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 80 },
      { name: 'Amchur Powder', description: 'Mango powder (250g)', price: 180.00, image: 'amchur.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.25, stock: 60 },
      { name: 'Kashmiri Chili', description: 'Kashmiri lal mirch (500g)', price: 280.00, image: 'kashmiri-chili.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 80 },
      { name: 'Curry Powder', description: 'Garam masala blend (500g)', price: 250.00, image: 'curry-powder.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 },
      { name: 'Chat Masala', description: 'Tangy chat masala (250g)', price: 120.00, image: 'chat-masala.png', categoryId: 6, unitTypeId: g500Unit.id, quantity: 0.25, stock: 80 }
    ];
    await db.Product.bulkCreate(rawPowderProducts);
    console.log('✅ Raw Powder Pack products created (15 products)');

    // Nutrition Pack Products (Category 7)
    const nutritionProducts = [
      { name: 'Almonds', description: 'Premium california almonds (1kg)', price: 1200.00, image: 'almonds-nutrition.png', categoryId: 7, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Cashews', description: 'Premium cashew nuts (1kg)', price: 1100.00, image: 'cashews-nutrition.png', categoryId: 7, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Walnuts', description: 'Shelled walnuts (500g)', price: 800.00, image: 'walnuts.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Raisins', description: 'Golden raisins (500g)', price: 300.00, image: 'raisins.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 80 },
      { name: 'Dates', description: 'Premium medjool dates (1kg)', price: 400.00, image: 'dates.png', categoryId: 7, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Fig', description: 'Dried figs (500g)', price: 450.00, image: 'figs.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 50 },
      { name: 'Apricots', description: 'Dried apricots (500g)', price: 350.00, image: 'apricots.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 50 },
      { name: 'Chia Seeds', description: 'Organic chia seeds (500g)', price: 280.00, image: 'chia-seeds.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Flax Seeds', description: 'Organic flax seeds (500g)', price: 180.00, image: 'flax-seeds.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 },
      { name: 'Pumpkin Seeds', description: 'Roasted pumpkin seeds (500g)', price: 250.00, image: 'pumpkin-seeds.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Sunflower Seeds', description: 'Roasted sunflower seeds (500g)', price: 200.00, image: 'sunflower-seeds.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Mixed Nuts', description: 'Premium mixed nuts (1kg)', price: 1500.00, image: 'mixed-nuts.png', categoryId: 7, unitTypeId: kgUnit.id, quantity: 1, stock: 50 },
      { name: 'Makhana', description: 'Roasted makhana/fox nuts (500g)', price: 350.00, image: 'makhana.png', categoryId: 7, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 },
      { name: 'Protein Powder', description: 'Whey protein powder (1kg)', price: 2500.00, image: 'protein-powder.png', categoryId: 7, unitTypeId: packUnit.id, quantity: 1, stock: 30 },
      { name: 'Multivitamin', description: 'Daily multivitamin tabs (60 pcs)', price: 800.00, image: 'multivitamin.png', categoryId: 7, unitTypeId: packUnit.id, quantity: 1, stock: 50 }
    ];
    await db.Product.bulkCreate(nutritionProducts);
    console.log('✅ Nutrition Pack products created (15 products)');

    // Dry Fruit Pack Products (Category 8)
    const dryFruitProducts = [
      { name: 'Almonds', description: 'Premium california almonds (1kg)', price: 1200.00, image: 'almonds-dry.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Cashews', description: 'Premium W320 cashews (1kg)', price: 1100.00, image: 'cashews-dry.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 1, stock: 100 },
      { name: 'Raisins (Kishmish)', description: 'Golden raisins (1kg)', price: 400.00, image: 'raisins-dry.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Walnuts', description: 'Shelled walnuts (500g)', price: 800.00, image: 'walnuts-dry.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 },
      { name: 'Pistachios', description: 'Premium pistachios (500g)', price: 900.00, image: 'pistachios.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Dates', description: 'Premium ajwa dates (1kg)', price: 500.00, image: 'dates-dry.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Figs', description: 'Anjeer dried figs (500g)', price: 450.00, image: 'figs-dry.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 50 },
      { name: 'Apricots', description: 'Dried apricots (500g)', price: 350.00, image: 'apricots-dry.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 50 },
      { name: 'Prunes', description: 'Dried plums/prunes (500g)', price: 400.00, image: 'prunes.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 40 },
      { name: 'Cranberries', description: 'Dried cranberries (500g)', price: 350.00, image: 'cranberries.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 50 },
      { name: 'Blueberries', description: 'Dried blueberries (500g)', price: 400.00, image: 'blueberries.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 40 },
      { name: 'Mixed Dry Fruits', description: 'Premium mix (1kg)', price: 1500.00, image: 'mixed-dryfruits.png', categoryId: 8, unitTypeId: kgUnit.id, quantity: 1, stock: 60 },
      { name: 'Pine Nuts', description: 'Chilgoza pine nuts (250g)', price: 800.00, image: 'pinenuts.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.25, stock: 30 },
      { name: 'Macadamia', description: 'Premium macadamia nuts (250g)', price: 600.00, image: 'macadamia.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.25, stock: 30 },
      { name: 'Brazil Nuts', description: 'Brazil nuts (500g)', price: 500.00, image: 'brazil-nuts.png', categoryId: 8, unitTypeId: g500Unit.id, quantity: 0.5, stock: 40 }
    ];
    await db.Product.bulkCreate(dryFruitProducts);
    console.log('✅ Dry Fruit Pack products created (15 products)');

    // Festival Pack Products (Category 9)
    const festivalProducts = [
      { name: 'Festival Dry Fruit Box', description: 'Premium dry fruit gift box', price: 1500.00, image: 'festival-dryfruit.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 50 },
      { name: 'Festival Sweets', description: 'Assorted Indian sweets', price: 800.00, image: 'festival-sweets.png', categoryId: 9, unitTypeId: kgUnit.id, quantity: 1, stock: 80 },
      { name: 'Dates Gift Box', description: 'Premium dates gift pack', price: 1000.00, image: 'festival-dates.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 50 },
      { name: 'Chocolate Box', description: 'Assorted chocolates', price: 600.00, image: 'festival-chocolate.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 60 },
      { name: 'Dry Fruit & Sweets Combo', description: 'Combo pack (dry fruits + sweets)', price: 2000.00, image: 'festival-combo.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 40 },
      { name: 'Premium Gift Hamper', description: 'Luxury gift hamper', price: 3000.00, image: 'festival-hamper.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 30 },
      { name: 'Festival Fruits Pack', description: 'Fresh seasonal fruits gift pack', price: 1200.00, image: 'festival-fruits.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 40 },
      { name: 'Cookies & Treats', description: 'Festival cookies pack', price: 400.00, image: 'festival-cookies.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 60 },
      { name: 'Honey Pack', description: 'Organic honey gift pack', price: 500.00, image: 'festival-honey.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 50 },
      { name: 'Namkeen Mix', description: 'Savory snacks mix', price: 350.00, image: 'festival-namkeen.png', categoryId: 9, unitTypeId: packUnit.id, quantity: 1, stock: 70 }
    ];
    await db.Product.bulkCreate(festivalProducts);
    console.log('✅ Festival Pack products created (10 products)');

    // Flower Pack Products (Category 10)
    const flowerProducts = [
      { name: 'Rose Bouquet', description: 'Fresh rose bouquet (12 pcs)', price: 350.00, image: 'rose-bouquet.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 50 },
      { name: 'Lotus Flowers', description: 'Fresh lotus (5 pcs)', price: 200.00, image: 'lotus.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 40 },
      { name: 'Marigold Flowers', description: 'Fresh marigold (100 g)', price: 80.00, image: 'marigold.png', categoryId: 10, unitTypeId: kgUnit.id, quantity: 0.1, stock: 80 },
      { name: 'Jasmine Flowers', description: 'Fresh jasmine (50 g)', price: 150.00, image: 'jasmine.png', categoryId: 10, unitTypeId: kgUnit.id, quantity: 0.05, stock: 50 },
      { name: 'Garland', description: 'Flower garland (1 pc)', price: 250.00, image: 'garland.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 40 },
      { name: 'Tulsi Leaves', description: 'Fresh tulsi leaves (bunch)', price: 50.00, image: 'tulsi.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 60 },
      { name: 'Coconut', description: 'Fresh coconut (1 pc)', price: 40.00, image: 'coconut.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 80 },
      { name: 'Banana Leaf', description: 'Fresh banana leaves (5 pcs)', price: 30.00, image: 'banana-leaf.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 100 },
      { name: 'Mogra Flowers', description: 'Fresh mogra/jasmine (50 g)', price: 200.00, image: 'mogra.png', categoryId: 10, unitTypeId: kgUnit.id, quantity: 0.05, stock: 40 },
      { name: 'Lily Flowers', description: 'Fresh lilies (6 pcs)', price: 300.00, image: 'lily.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 30 },
      { name: 'Orchid Bunch', description: 'Fresh orchids bunch', price: 450.00, image: 'orchid.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 20 },
      { name: 'Mixed Flower Bouquet', description: 'Assorted flowers bouquet', price: 400.00, image: 'mixed-bouquet.png', categoryId: 10, unitTypeId: pieceUnit.id, quantity: 1, stock: 40 }
    ];
    await db.Product.bulkCreate(flowerProducts);
    console.log('✅ Flower Pack products created (12 products)');

    // Sprouts Pack Products (Category 11)
    const sproutsProducts = [
      { name: 'Moong Sprouts', description: 'Fresh moong bean sprouts (500g)', price: 60.00, image: 'moong-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 80 },
      { name: 'Chana Sprouts', description: 'Fresh chana sprouts (500g)', price: 50.00, image: 'chana-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 70 },
      { name: 'Horse Gram Sprouts', description: 'Fresh kulthi sprouts (500g)', price: 50.00, image: 'horsegram-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Masoor Sprouts', description: 'Fresh masoor sprouts (500g)', price: 55.00, image: 'masoor-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 },
      { name: 'Alfalfa Sprouts', description: 'Fresh alfalfa sprouts (250g)', price: 80.00, image: 'alfalfa-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.25, stock: 40 },
      { name: 'Broccoli Sprouts', description: 'Fresh broccoli sprouts (250g)', price: 100.00, image: 'broccoli-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.25, stock: 30 },
      { name: 'Radish Sprouts', description: 'Fresh radish sprouts (250g)', price: 70.00, image: 'radish-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.25, stock: 40 },
      { name: 'Sunflower Sprouts', description: 'Fresh sunflower sprouts (250g)', price: 75.00, image: 'sunflower-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.25, stock: 40 },
      { name: 'Wheatgrass', description: 'Fresh wheatgrass (100g)', price: 100.00, image: 'wheatgrass.png', categoryId: 11, unitTypeId: kgUnit.id, quantity: 0.1, stock: 50 },
      { name: 'Mixed Sprouts', description: 'Assorted sprouts mix (500g)', price: 80.00, image: 'mixed-sprouts.png', categoryId: 11, unitTypeId: g500Unit.id, quantity: 0.5, stock: 60 }
    ];
    await db.Product.bulkCreate(sproutsProducts);
    console.log('✅ Sprouts Pack products created (10 products)\n');

    // ==============================
    // CREATE PACK TYPES FOR EACH CATEGORY
    // ==============================
    console.log('📦 Creating pack types for each category...\n');

    const packTypesData = [
      // Fruits Pack (Category 1) - Small Fruit Pack at ₹599
      { name: 'Small Fruit Pack', categoryId: 1, duration: 'small', basePrice: 599.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Seasonal Fruits', weight: 'Approx 3-4 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Fruit Pack', categoryId: 1, duration: 'medium', basePrice: 999.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Fruit Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Fruit Pack', categoryId: 1, duration: 'large', basePrice: 1799.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8-12 Premium + Seasonal Fruits', weight: 'Approx 10-15 Kg', targetAudience: 'Health Enthusiasts', includesExotic: true },
      { name: 'Custom Fruit Pack', categoryId: 1, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Vegetables Pack (Category 2)
      { name: 'Small Vegetable Pack', categoryId: 2, duration: 'small', basePrice: 399.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '6-8 Basic Vegetables', weight: 'Approx 3-4 Kg', targetAudience: 'Daily Cooking Essentials' },
      { name: 'Medium Vegetable Pack', categoryId: 2, duration: 'medium', basePrice: 699.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '10-12 Vegetable Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'Includes Leafy Vegetables' },
      { name: 'Large Vegetable Pack', categoryId: 2, duration: 'large', basePrice: 1299.00, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '15+ Vegetable Varieties', weight: 'Approx 10-12 Kg', targetAudience: 'Includes Leafy + Seasonal Specials' },
      { name: 'Custom Vegetable Pack', categoryId: 2, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Grocery Pack (Category 3)
      { name: 'Small Grocery Pack', categoryId: 3, duration: 'small', basePrice: 499.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: 'Rice, Dal, Oil, Salt, Spices', weight: 'Approx 4-5 Kg', targetAudience: 'Ideal for Small Families' },
      { name: 'Medium Grocery Pack', categoryId: 3, duration: 'medium', basePrice: 899.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: 'Rice, Pulses, Oil, Atta, Basic Spices', weight: 'Approx 8-10 Kg', targetAudience: 'Complete Kitchen Essentials' },
      { name: 'Large Grocery Pack', categoryId: 3, duration: 'large', basePrice: 1699.00, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Month', itemCount: 'Rice, Atta, Pulses, Oil, Spices, Sugar', weight: 'Approx 15-20 Kg', targetAudience: 'Full Kitchen Setup' },
      { name: 'Custom Grocery Pack', categoryId: 3, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Juices Pack (Category 4)
      { name: 'Small Juice Pack', categoryId: 4, duration: 'small', basePrice: 399.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '3-4 Juice Varieties', weight: 'Approx 3-4 Bottles', targetAudience: 'Healthy Daily Drink' },
      { name: 'Medium Juice Pack', categoryId: 4, duration: 'medium', basePrice: 699.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Juice Varieties', weight: 'Approx 6-8 Bottles', targetAudience: 'Kids + Adults' },
      { name: 'Large Juice Pack', categoryId: 4, duration: 'large', basePrice: 1199.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8-10 Juice Varieties', weight: 'Approx 10-12 Bottles', targetAudience: 'Includes Detox Juices' },
      { name: 'Custom Juice Pack', categoryId: 4, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Millets Pack (Category 5)
      { name: 'Small Millets Pack', categoryId: 5, duration: 'small', basePrice: 349.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '2-3 Millets Types', weight: 'Approx 1.5-2 Kg', targetAudience: 'Beginner Friendly' },
      { name: 'Medium Millets Pack', categoryId: 5, duration: 'medium', basePrice: 599.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '4-5 Millets Types', weight: 'Approx 3-4 Kg', targetAudience: 'Weekly Healthy Meals' },
      { name: 'Large Millets Pack', categoryId: 5, duration: 'large', basePrice: 999.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '6-8 Millet Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'For Regular Millet Consumers' },
      { name: 'Custom Millets Pack', categoryId: 5, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Raw Powder Pack (Category 6)
      { name: 'Small Raw Powder Pack', categoryId: 6, duration: 'small', basePrice: 399.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '3-4 Raw Powders', weight: 'Approx 500g – 1 Kg', targetAudience: 'Daily Health Mix' },
      { name: 'Medium Raw Powder Pack', categoryId: 6, duration: 'medium', basePrice: 699.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Raw Powders', weight: 'Approx 1.5-2 Kg', targetAudience: 'Family Nutrition' },
      { name: 'Large Raw Powder Pack', categoryId: 6, duration: 'large', basePrice: 1199.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8+ Raw Powders', weight: 'Approx 3-4 Kg', targetAudience: 'For Regular Wellness Use' },
      { name: 'Custom Raw Powder Pack', categoryId: 6, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Nutrition Pack (Category 7)
      { name: 'Small Nutrition Pack', categoryId: 7, duration: 'small', basePrice: 499.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: 'Sprouts + Fruits + Nuts Mix', weight: 'Approx 2-3 Kg', targetAudience: 'Balanced Nutrition' },
      { name: 'Medium Nutrition Pack', categoryId: 7, duration: 'medium', basePrice: 899.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: 'Fruits + Sprouts + Millets + Nuts', weight: 'Approx 5-6 Kg', targetAudience: 'Weekly Nutrition' },
      { name: 'Large Nutrition Pack', categoryId: 7, duration: 'large', basePrice: 1599.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: 'Fruits + Juices + Millets + Nuts + Powders', weight: 'Approx 8-10 Kg', targetAudience: 'Full Health Diet Pack' },
      { name: 'Custom Nutrition Pack', categoryId: 7, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Dry Fruit Pack (Category 8)
      { name: 'Small Dry Fruit Pack', categoryId: 8, duration: 'small', basePrice: 499.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: 'Almonds, Cashews, Raisins', weight: 'Approx 500g – 1 Kg', targetAudience: 'Daily Energy' },
      { name: 'Medium Dry Fruit Pack', categoryId: 8, duration: 'medium', basePrice: 899.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Dry Fruit Varieties', weight: 'Approx 1.5-2 Kg', targetAudience: 'Family Health Pack' },
      { name: 'Large Dry Fruit Pack', categoryId: 8, duration: 'large', basePrice: 1699.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8+ Premium Dry Fruits', weight: 'Approx 3-4 Kg', targetAudience: 'Premium Box' },
      { name: 'Custom Dry Fruit Pack', categoryId: 8, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Festival Pack (Category 9)
      { name: 'Small Festival Pack', categoryId: 9, duration: 'small', basePrice: 799.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: 'Festival Special', itemCount: 'Dry Fruits + Sweets + Fruits', weight: 'Approx 2-3 Kg', targetAudience: 'Ideal for Small Gifting' },
      { name: 'Medium Festival Pack', categoryId: 9, duration: 'medium', basePrice: 1499.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: 'Festival Special', itemCount: 'Dry Fruits + Fruits + Juices + Flowers', weight: 'Approx 4-5 Kg', targetAudience: 'Family Celebration' },
      { name: 'Large Festival Pack', categoryId: 9, duration: 'large', basePrice: 2499.00, sizeLabel: '🔴 Large', persons: 'Joint Family', days: 'Festival Special', itemCount: 'Premium Dry Fruits + Fruits + Sweets + Flower Basket', weight: 'Approx 8-10 Kg', targetAudience: 'Premium Gift Box' },
      { name: 'Custom Festival Pack', categoryId: 9, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Flower Pack (Category 10)
      { name: 'Small Flower Pack', categoryId: 10, duration: 'small', basePrice: 249.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: 'Daily', itemCount: 'Loose Flowers / Small Garland', weight: 'Approx 250–500g', targetAudience: 'Daily Pooja' },
      { name: 'Medium Flower Pack', categoryId: 10, duration: 'medium', basePrice: 449.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: 'Weekly', itemCount: 'Mixed Flowers + Garlands', weight: 'Approx 1 Kg', targetAudience: 'Temple / Home Use' },
      { name: 'Large Flower Pack', categoryId: 10, duration: 'large', basePrice: 799.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Events', days: 'Weekly', itemCount: 'Bulk Flowers + Garlands', weight: 'Approx 2-3 Kg', targetAudience: 'Event / Decoration' },
      { name: 'Custom Flower Pack', categoryId: 10, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' },

      // Sprouts Pack (Category 11)
      { name: 'Small Sprouts Pack', categoryId: 11, duration: 'small', basePrice: 199.00, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '2-3 Sprout Varieties', weight: 'Approx 500g – 1 Kg', targetAudience: 'Health Starter' },
      { name: 'Medium Sprouts Pack', categoryId: 11, duration: 'medium', basePrice: 349.00, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '4-5 Sprout Varieties', weight: 'Approx 1.5-2 Kg', targetAudience: 'Weekly Health' },
      { name: 'Large Sprouts Pack', categoryId: 11, duration: 'large', basePrice: 599.00, sizeLabel: '🔴 Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '6+ Sprout Varieties', weight: 'Approx 3-4 Kg', targetAudience: 'Protein Pack' },
      { name: 'Custom Sprouts Pack', categoryId: 11, duration: 'custom', basePrice: 0, sizeLabel: '⚪ Custom', persons: 'Any', days: 'Custom', itemCount: 'Choose Any Items', weight: 'Custom', targetAudience: 'Personalized' }
    ];

    await db.PackType.bulkCreate(packTypesData);
    console.log('✅ Pack types created for all 11 categories (44 pack types)\n');

    // ==============================
    // CREATE PACKS FOR ALL CATEGORIES
    // ==============================
    console.log('📦 Creating packs for all categories...\n');

    const packTypes = await db.PackType.findAll();
    const categoriesData = await db.Category.findAll();

    const packsData = [];
    for (const packType of packTypes) {
      if (packType.categoryId) {
        const category = categoriesData.find(c => c.id === packType.categoryId);
        if (category) {
          packsData.push({
            name: packType.name,
            description: `${packType.itemCount} - ${packType.weight}`,
            categoryId: packType.categoryId,
            packTypeId: packType.id,
            basePrice: packType.basePrice,
            finalPrice: packType.basePrice,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            isActive: true
          });
        }
      }
    }

    await db.Pack.bulkCreate(packsData);
    console.log('✅ Packs created for all categories\n');

    // ==============================
    // CREATE PACK-PRODUCT ASSOCIATIONS
    // ==============================
    console.log('📦 Creating pack-product associations...\n');

    const packs = await db.Pack.findAll();
    const products = await db.Product.findAll();

    // Group products by category
    const productsByCategory = {};
    for (const product of products) {
      if (!productsByCategory[product.categoryId]) {
        productsByCategory[product.categoryId] = [];
      }
      productsByCategory[product.categoryId].push(product);
    }

    // Create associations - add all category products to each pack
    const packProductData = [];
    for (const pack of packs) {
      const categoryProducts = productsByCategory[pack.categoryId] || [];
      if (categoryProducts.length > 0) {
        // Add all products to the pack
        for (const product of categoryProducts) {
          packProductData.push({
            packId: pack.id,
            productId: product.id,
            quantity: 1,
            unitPrice: product.price
          });
        }
      }
    }

    await db.PackProduct.bulkCreate(packProductData);
    console.log('✅ Pack-product associations created\n');

    // ==============================
    // SUMMARY
    // ==============================
    console.log('=============================================');
    console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
    console.log('=============================================\n');

    const finalCategories = await db.Category.count();
    const finalProducts = await db.Product.count();
    const finalPackTypes = await db.PackType.count();
    const finalPacks = await db.Pack.count();
    const finalPackProducts = await db.PackProduct.count();

    console.log('📊 Final Database Summary:');
    console.log(`   • Categories: ${finalCategories}`);
    console.log(`   • Products: ${finalProducts}`);
    console.log(`   • Pack Types: ${finalPackTypes}`);
    console.log(`   • Packs: ${finalPacks}`);
    console.log(`   • Pack-Product Associations: ${finalPackProducts}`);
    console.log('\n✅ All tables start from ID 1!\n');

    await db.sequelize.close();
    console.log('🔌 Database connection closed.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the seed function
flushAndSeed();
