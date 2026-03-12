require('dotenv').config();

async function updateSmallFruitPack() {
  try {
    const models = require('./models/index');
    const { Product, UnitType, Category, Pack, PackProduct, PackType } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    // Get or create Fruits category
    let fruitCategory = await Category.findOne({ where: { name: 'Fruits' } });
    if (!fruitCategory) {
      fruitCategory = await Category.create({
        name: 'Fruits',
        description: 'Fresh fruits delivery',
        image: 'fruits.png',
        isActive: true
      });
      console.log('✓ Created Fruits category');
    } else {
      console.log('✓ Found Fruits category:', fruitCategory.id);
    }

    // Get unit types
    const unitTypes = await UnitType.findAll();
    const gUnit = unitTypes.find(u => u.abbreviation === 'G');
    const pcUnit = unitTypes.find(u => u.abbreviation === 'PC');

    console.log('✓ Unit types:', { g: gUnit?.id, pc: pcUnit?.id });

    // Delete existing Small Fruit Pack
    await PackProduct.destroy({
      where: {},
      truncate: true,
      force: true
    });
    console.log('✓ Deleted all pack products');

    // Get Small pack type
    const smallPackType = await PackType.findOne({ where: { duration: 'small' } });
    console.log('✓ Found Small pack type:', smallPackType?.id);

    // Delete existing packs with similar names
    const existingPacks = await Pack.findAll({ where: { categoryId: fruitCategory.id } });
    for (const pack of existingPacks) {
      await pack.destroy();
    }
    console.log('✓ Deleted existing packs in Fruits category');

    // Create the 8 fruit products
    const fruitProducts = [
      { name: 'Apple', description: '500 g (3–4 pcs)', price: 90, marketPrice: 180, quantity: 500, unitTypeId: gUnit.id },
      { name: 'Banana', description: '6 pcs', price: 25, marketPrice: 50, quantity: 6, unitTypeId: pcUnit.id },
      { name: 'Orange', description: 'Sweet Lime - 500 g (3–4 pcs)', price: 40, marketPrice: 80, quantity: 500, unitTypeId: gUnit.id },
      { name: 'Pomegranate', description: '2 pcs', price: 80, marketPrice: 160, quantity: 2, unitTypeId: pcUnit.id },
      { name: 'Papaya', description: '1 medium', price: 40, marketPrice: 50, quantity: 1, unitTypeId: pcUnit.id },
      { name: 'Guava', description: '500 g', price: 35, marketPrice: 70, quantity: 500, unitTypeId: gUnit.id },
      { name: 'Grapes', description: '500 g', price: 45, marketPrice: 90, quantity: 500, unitTypeId: gUnit.id },
      { name: 'Seasonal Fruit', description: 'Mango / Sapota / Watermelon piece - 500 g', price: 40, marketPrice: 80, quantity: 500, unitTypeId: gUnit.id }
    ];

    // Delete existing products in Fruits category
    await Product.destroy({ where: { categoryId: fruitCategory.id } });
    console.log('✓ Deleted existing fruit products');

    // Create fruit products
    const createdProducts = await Product.bulkCreate(
      fruitProducts.map(p => ({
        ...p,
        categoryId: fruitCategory.id,
        image: `${p.name.toLowerCase()}.png`,
        stock: 1000,
        isActive: true
      }))
    );
    console.log(`✓ Created ${createdProducts.length} fruit products`);

    // Calculate base price - ensure it's a number
    const basePrice = createdProducts.reduce((sum, p) => sum + parseFloat(p.price), 0);
    console.log(`  Total base price: ₹${basePrice}`);

    // Create Small Fruit Pack – 599
    const smallFruitPack = await Pack.create({
      name: 'Small Fruit Pack – 599',
      description: 'A curated selection of 8 fresh seasonal fruits including Apple, Banana, Orange, Pomegranate, Papaya, Guava, Grapes, and Seasonal fruits. Total cost: ₹395-420. Selling Price: ₹599. Margin: ₹170-200',
      categoryId: fruitCategory.id,
      packTypeId: smallPackType.id,
      basePrice: basePrice,
      finalPrice: 599,
      validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      isActive: true
    });
    console.log(`✓ Created pack: ${smallFruitPack.name} (ID: ${smallFruitPack.id})`);

    // Add products to pack (all 8 checked)
    const packProducts = createdProducts.map(product => ({
      packId: smallFruitPack.id,
      productId: product.id,
      quantity: 1,
      unitPrice: product.price
    }));

    await PackProduct.bulkCreate(packProducts);
    console.log(`✓ Added ${packProducts.length} products to pack`);

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Pack: ${smallFruitPack.name}`);
    console.log(`  - Base Price: ₹${basePrice}`);
    console.log(`  - Final Price: ₹${smallFruitPack.finalPrice}`);
    console.log(`  - Products (checked): ${createdProducts.length}`);
    createdProducts.forEach((p, i) => {
      console.log(`    ${i + 1}. ${p.name} - ₹${p.price}`);
    });

    console.log('\n✓ Small Fruit Pack created successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSmallFruitPack();
