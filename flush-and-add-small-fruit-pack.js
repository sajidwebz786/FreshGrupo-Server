require('dotenv').config();

async function flushDatabaseAndAddSmallFruitPack() {
  try {
    const models = require('./models/index');
    const { 
      Product, UnitType, Category, Pack, PackProduct, PackType,
      Order, OrderPackContent, Cart, CartItem, Notification,
      Payment, Wallet, WalletTransaction, Address, CreditPackage, RewardConfig,
      User, DeleteRequest
    } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    // ==============================
    // FLUSH ALL DATA EXCEPT USERS
    // ==============================
    console.log('\n--- Flushing all data except users ---');

    try {
      await DeleteRequest.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted DeleteRequests');
    } catch (e) { console.log('  (DeleteRequests table not found or empty)'); }

    try {
      await WalletTransaction.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted WalletTransactions');
    } catch (e) { console.log('  (WalletTransactions table not found or empty)'); }

    try {
      await Notification.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Notifications');
    } catch (e) { console.log('  (Notifications table not found or empty)'); }

    try {
      await OrderPackContent.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted OrderPackContents');
    } catch (e) { console.log('  (OrderPackContents table not found or empty)'); }

    try {
      await Order.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Orders');
    } catch (e) { console.log('  (Orders table not found or empty)'); }

    try {
      await CartItem.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted CartItems');
    } catch (e) { console.log('  (CartItems table not found or empty)'); }

    try {
      await Cart.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Carts');
    } catch (e) { console.log('  (Carts table not found or empty)'); }

    try {
      await Address.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Addresses');
    } catch (e) { console.log('  (Addresses table not found or empty)'); }

    try {
      await Payment.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Payments');
    } catch (e) { console.log('  (Payments table not found or empty)'); }

    try {
      await CreditPackage.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted CreditPackages');
    } catch (e) { console.log('  (CreditPackages table not found or empty)'); }

    try {
      await RewardConfig.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted RewardConfigs');
    } catch (e) { console.log('  (RewardConfigs table not found or empty)'); }

    try {
      await PackProduct.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted PackProducts');
    } catch (e) { console.log('  (PackProducts table not found or empty)'); }

    try {
      await Pack.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Packs');
    } catch (e) { console.log('  (Packs table not found or empty)'); }

    try {
      await Product.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Products');
    } catch (e) { console.log('  (Products table not found or empty)'); }

    try {
      await Category.destroy({ where: {}, truncate: true });
      console.log('✓ Deleted Categories');
    } catch (e) { console.log('  (Categories table not found or empty)'); }

    // Keep UnitTypes and PackTypes - they are reference tables
    // But let's check if they exist
    let unitTypeRecords = await UnitType.findAll();
    if (unitTypeRecords.length === 0) {
      await UnitType.bulkCreate([
        { name: 'Kilogram', abbreviation: 'kg', description: 'Weight in kilograms' },
        { name: 'Gram', abbreviation: 'g', description: 'Weight in grams' },
        { name: 'Piece', abbreviation: 'pc', description: 'Individual pieces' },
        { name: 'Dozen', abbreviation: 'doz', description: 'Dozen items' },
        { name: '500 Grams', abbreviation: '500g', description: '500 grams pack' },
        { name: 'Bottle', abbreviation: 'btl', description: 'Bottled items' },
        { name: 'Liter', abbreviation: 'L', description: 'Liquid in liters' }
      ]);
      unitTypeRecords = await UnitType.findAll();
      console.log('✓ Created UnitTypes');
    } else {
      console.log('✓ UnitTypes already exist');
    }

    let packTypeRecords = await PackType.findAll();
    if (packTypeRecords.length === 0) {
      await PackType.bulkCreate([
        { name: 'Small', duration: 'small', description: 'Small pack', price: 2000 },
        { name: 'Medium', duration: 'medium', description: 'Medium pack', price: 3500 },
        { name: 'Large', duration: 'large', description: 'Large pack', price: 6000 },
        { name: 'Custom', duration: 'custom', description: 'Custom pack', price: 2000 }
      ]);
      packTypeRecords = await PackType.findAll();
      console.log('✓ Created PackTypes');
    } else {
      console.log('✓ PackTypes already exist');
    }

    // ==============================
    // CREATE CATEGORIES
    // ==============================
    console.log('\n--- Creating categories ---');
    
    // Check if Fruits category already exists
    let fruitCategory = await Category.findOne({ where: { name: 'Fruits' } });
    if (fruitCategory) {
      console.log('✓ Fruits category already exists (ID: ' + fruitCategory.id + ')');
      // Delete existing products and packs for this category
      await Product.destroy({ where: { categoryId: fruitCategory.id } });
      console.log('  ✓ Deleted existing products');
      
      const existingPacks = await Pack.findAll({ where: { categoryId: fruitCategory.id } });
      for (const pack of existingPacks) {
        await PackProduct.destroy({ where: { packId: pack.id } });
        await pack.destroy();
      }
      console.log('  ✓ Deleted existing packs');
    } else {
      fruitCategory = await Category.create({
        name: 'Fruits',
        description: 'Fresh fruits delivery',
        image: 'fruits.png',
        isActive: true
      });
      console.log('✓ Created category: Fruits');
    }

    // ==============================
    // GET UNIT TYPES
    // ==============================
    const kgUnit = unitTypeRecords.find(u => u.abbreviation === 'KG');
    const pcUnit = unitTypeRecords.find(u => u.abbreviation === 'PC');
    const gUnit = unitTypeRecords.find(u => u.abbreviation === 'G');
    const unit500g = unitTypeRecords.find(u => u.abbreviation === '500G');

    console.log('✓ Found unit types:', { kg: kgUnit?.id, pc: pcUnit?.id, g: gUnit?.id, '500g': unit500g?.id });

    // ==============================
    // GET PACK TYPE (SMALL)
    // ==============================
    const smallPackType = packTypeRecords.find(pt => pt.duration === 'small');
    console.log(`✓ Found Small pack type: ${smallPackType.id}`);

    // ==============================
    // CREATE FRUIT PRODUCTS FOR SMALL FRUIT PACK
    // ==============================
    console.log('\n--- Creating fruit products ---');

    // Based on user data:
    // SNO  Fruit          Quantity          Approx Market Price  Pack Value
    // 1    Apple          500 g (3–4 pcs)   ₹180/kg             ₹90
    // 2    Banana         6 pcs             ₹50/dozen           ₹25
    // 3    Orange/Sweet Lime  500 g      ₹80/kg               ₹40
    // 4    Pomegranate    2 pcs             ₹160/kg             ₹80
    // 5    Papaya         1 medium          ₹50/kg              ₹40
    // 6    Guava          500 g             ₹70/kg              ₹35
    // 7    Grapes         500 g             ₹90/kg              ₹45
    // 8    Seasonal Fruit 500 g            ₹80/kg              ₹40

    const products = [
      {
        name: 'Apple',
        description: '500 g (3–4 pcs)',
        price: 90,
        marketPrice: 180,
        image: 'apple.png',
        categoryId: fruitCategory.id,
        unitTypeId: unit500g.id,
        quantity: 500,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Banana',
        description: '6 pcs',
        price: 25,
        marketPrice: 50,
        image: 'banana.png',
        categoryId: fruitCategory.id,
        unitTypeId: pcUnit.id,
        quantity: 6,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Orange',
        description: 'Sweet Lime - 500 g (3–4 pcs)',
        price: 40,
        marketPrice: 80,
        image: 'orange.png',
        categoryId: fruitCategory.id,
        unitTypeId: unit500g.id,
        quantity: 500,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Pomegranate',
        description: '2 pcs',
        price: 80,
        marketPrice: 160,
        image: 'pomegranate.png',
        categoryId: fruitCategory.id,
        unitTypeId: pcUnit.id,
        quantity: 2,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Papaya',
        description: '1 medium',
        price: 40,
        marketPrice: 50,
        image: 'papaya.png',
        categoryId: fruitCategory.id,
        unitTypeId: pcUnit.id,
        quantity: 1,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Guava',
        description: '500 g',
        price: 35,
        marketPrice: 70,
        image: 'guava.png',
        categoryId: fruitCategory.id,
        unitTypeId: unit500g.id,
        quantity: 500,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Grapes',
        description: '500 g',
        price: 45,
        marketPrice: 90,
        image: 'grapes.png',
        categoryId: fruitCategory.id,
        unitTypeId: unit500g.id,
        quantity: 500,
        stock: 1000,
        isActive: true
      },
      {
        name: 'Seasonal Fruit',
        description: 'Mango / Sapota / Watermelon piece - 500 g',
        price: 40,
        marketPrice: 80,
        image: 'seasonal.png',
        categoryId: fruitCategory.id,
        unitTypeId: unit500g.id,
        quantity: 500,
        stock: 1000,
        isActive: true
      }
    ];

    const createdProducts = await Product.bulkCreate(products);
    console.log(`✓ Created ${createdProducts.length} fruit products`);

    // Calculate total base price (ensure numeric)
    const basePrice = createdProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    console.log(`  Total base price: ₹${basePrice}`);

    // ==============================
    // CREATE SMALL FRUIT PACK
    // ==============================
    console.log('\n--- Creating Small Fruit Pack ---');

    const smallFruitPack = await Pack.create({
      name: 'Small Fruit Pack',
      description: 'A curated selection of 8 fresh seasonal fruits including Apple, Banana, Orange, Pomegranate, Papaya, Guava, Grapes, and Seasonal fruits. Total cost: ₹395-420. Selling Price: ₹599. Margin: ₹170-200',
      categoryId: fruitCategory.id,
      packTypeId: smallPackType.id,
      basePrice: basePrice,
      finalPrice: 599,
      validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
      isActive: true
    });
    console.log(`✓ Created pack: ${smallFruitPack.name} (ID: ${smallFruitPack.id})`);

    // ==============================
    // CREATE PACK PRODUCTS
    // ==============================
    console.log('\n--- Adding products to pack ---');

    const packProducts = createdProducts.map(product => ({
      packId: smallFruitPack.id,
      productId: product.id,
      quantity: 1,
      unitPrice: product.price
    }));

    await PackProduct.bulkCreate(packProducts);
    console.log(`✓ Added ${packProducts.length} products to pack`);

    // ==============================
    // SUMMARY
    // ==============================
    console.log('\n=== SUMMARY ===');
    console.log(`Category: ${fruitCategory.name} (ID: ${fruitCategory.id})`);
    console.log(`Pack: ${smallFruitPack.name}`);
    console.log(`  - Base Price: ₹${basePrice}`);
    console.log(`  - Final Price: ₹${smallFruitPack.finalPrice}`);
    console.log(`  - Products: ${createdProducts.length}`);
    createdProducts.forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.name} - ₹${p.price}`);
    });

    console.log('\n✓ Database flushed and Small Fruit Pack created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

flushDatabaseAndAddSmallFruitPack();
