const { User, Category, Product, UnitType, PackType, Pack, PackProduct } = require('../models');
const bcrypt = require('bcrypt');

async function seedDatabase() {
  try {
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('Welcome@919', 10);
    const hashedDeliveryPassword = await bcrypt.hash('delivery123', 10);

    // Create sample users
    const users = await User.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'customer'
      },
      {
        name: 'Admin User',
        email: 'admin@freshgrupo.com',
        phone: '+1234567891',
        password: hashedAdminPassword,
        role: 'admin'
      },
      {
        name: 'Delivery Person',
        email: 'delivery@Freshgrupo.com',
        phone: '+1234567892',
        password: hashedDeliveryPassword,
        role: 'delivery'
      }
    ]);

    // Create unit types first
    const unitTypes = await UnitType.bulkCreate([
      {
        name: 'Kilogram',
        abbreviation: 'KG',
        description: 'Weight in kilograms'
      },
      {
        name: 'Gram',
        abbreviation: 'G',
        description: 'Weight in grams'
      },
      {
        name: 'Box',
        abbreviation: 'BOX',
        description: 'Quantity in boxes'
      },
      {
        name: 'Piece',
        abbreviation: 'PC',
        description: 'Individual pieces'
      },
      {
        name: 'Bunch',
        abbreviation: 'BUNCH',
        description: 'Bunches or bundles'
      },
      {
        name: 'Liter',
        abbreviation: 'L',
        description: 'Volume in liters'
      },
      {
        name: 'Packet',
        abbreviation: 'PKT',
        description: 'Packaged items'
      }
    ]);

    // Create 3 categories only
    const categories = await Category.bulkCreate([
      {
        name: 'Vegetables',
        description: 'Fresh vegetables and greens',
        image: 'vegetables.jpg'
      },
      {
        name: 'Fruits',
        description: 'Fresh fruits and seasonal produce',
        image: 'fruits.jpg'
      },
      {
        name: 'Groceries',
        description: 'Essential grocery items and staples',
        image: 'groceries.jpg'
      }
    ]);

    // Create pack types
    const packTypes = await PackType.bulkCreate([
      {
        name: 'Weekly Pack',
        duration: 'weekly',
        basePrice: 2500.00
      },
      {
        name: 'Bi-Weekly Pack',
        duration: 'bi-weekly',
        basePrice: 5000.00
      },
      {
        name: 'Monthly Pack',
        duration: 'monthly',
        basePrice: 10000.00
      }
    ]);

    // Create sample products
    const products = await Product.bulkCreate([
      // Vegetables (10 products)
      {
        name: 'Fresh Spinach',
        description: 'Organic baby spinach leaves',
        price: 80.00,
        image: 'spinach.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 100
      },
      {
        name: 'Tomatoes',
        description: 'Vine-ripened red tomatoes',
        price: 60.00,
        image: 'tomatoes.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 150
      },
      {
        name: 'Potatoes',
        description: 'Fresh farm potatoes',
        price: 40.00,
        image: 'potatoes.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 200
      },
      {
        name: 'Carrots',
        description: 'Crisp orange carrots',
        price: 50.00,
        image: 'carrots.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 120
      },
      {
        name: 'Onions',
        description: 'Red and white onions',
        price: 35.00,
        image: 'onions.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 180
      },
      {
        name: 'Bell Peppers',
        description: 'Colorful bell peppers',
        price: 90.00,
        image: 'bell-peppers.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 80
      },
      {
        name: 'Broccoli',
        description: 'Fresh green broccoli',
        price: 120.00,
        image: 'broccoli.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 70
      },
      {
        name: 'Cauliflower',
        description: 'Fresh cauliflower heads',
        price: 60.00,
        image: 'cauliflower.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[3].id, // PC
        quantity: 1,
        stock: 90
      },
      {
        name: 'Green Beans',
        description: 'Fresh green beans',
        price: 70.00,
        image: 'green-beans.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 110
      },
      {
        name: 'Cabbage',
        description: 'Fresh green cabbage',
        price: 45.00,
        image: 'cabbage.jpg',
        categoryId: categories[0].id,
        unitTypeId: unitTypes[3].id, // PC
        quantity: 1,
        stock: 130
      },

      // Fruits (10 products)
      {
        name: 'Fresh Bananas',
        description: 'Sweet and ripe bananas',
        price: 50.00,
        image: 'bananas.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[3].id, // PC (pieces)
        quantity: 6,
        stock: 200
      },
      {
        name: 'Organic Apples',
        description: 'Crisp and juicy organic apples',
        price: 120.00,
        image: 'apples.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 100
      },
      {
        name: 'Oranges',
        description: 'Sweet and juicy oranges',
        price: 80.00,
        image: 'oranges.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 150
      },
      {
        name: 'Mangoes',
        description: 'Sweet seasonal mangoes',
        price: 150.00,
        image: 'mangoes.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 80
      },
      {
        name: 'Grapes',
        description: 'Fresh seedless grapes',
        price: 100.00,
        image: 'grapes.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 90
      },
      {
        name: 'Strawberries',
        description: 'Sweet strawberries',
        price: 200.00,
        image: 'strawberries.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[2].id, // BOX
        quantity: 1,
        stock: 60
      },
      {
        name: 'Pineapple',
        description: 'Fresh tropical pineapple',
        price: 80.00,
        image: 'pineapple.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[3].id, // PC
        quantity: 1,
        stock: 70
      },
      {
        name: 'Watermelon',
        description: 'Refreshing watermelon',
        price: 40.00,
        image: 'watermelon.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[3].id, // PC
        quantity: 1,
        stock: 50
      },
      {
        name: 'Papaya',
        description: 'Ripe papaya fruit',
        price: 60.00,
        image: 'papaya.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 85
      },
      {
        name: 'Kiwi',
        description: 'Fresh kiwi fruit',
        price: 180.00,
        image: 'kiwi.jpg',
        categoryId: categories[1].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 65
      },

      // Groceries (15 products)
      {
        name: 'Rice',
        description: 'Premium quality rice',
        price: 80.00,
        image: 'rice.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 100
      },
      {
        name: 'Wheat Flour',
        description: 'Fresh wheat flour',
        price: 60.00,
        image: 'flour.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 120
      },
      {
        name: 'Cooking Oil',
        description: 'Pure cooking oil',
        price: 150.00,
        image: 'oil.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[5].id, // L (liter)
        quantity: 1,
        stock: 80
      },
      {
        name: 'Sugar',
        description: 'Refined white sugar',
        price: 50.00,
        image: 'sugar.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 150
      },
      {
        name: 'Salt',
        description: 'Iodized salt',
        price: 20.00,
        image: 'salt.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PKT (packet)
        quantity: 1,
        stock: 200
      },
      {
        name: 'Tea',
        description: 'Premium tea leaves',
        price: 200.00,
        image: 'tea.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[1].id, // G (grams)
        quantity: 500,
        stock: 60
      },
      {
        name: 'Coffee Powder',
        description: 'Rich coffee powder',
        price: 300.00,
        image: 'coffee.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[1].id, // G (grams)
        quantity: 500,
        stock: 45
      },
      {
        name: 'Masala Spices',
        description: 'Mixed spice blend',
        price: 120.00,
        image: 'masala.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PKT
        quantity: 1,
        stock: 90
      },
      {
        name: 'Lentils (Dal)',
        description: 'Assorted lentils',
        price: 90.00,
        image: 'lentils.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 110
      },
      {
        name: 'Pasta',
        description: 'Italian pasta',
        price: 85.00,
        image: 'pasta.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PKT
        quantity: 1,
        stock: 75
      },
      {
        name: 'Tomato Ketchup',
        description: 'Tangy tomato sauce',
        price: 95.00,
        image: 'ketchup.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[2].id, // BOX
        quantity: 1,
        stock: 130
      },
      {
        name: 'Biscuits',
        description: 'Assorted biscuits',
        price: 65.00,
        image: 'biscuits.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PKT
        quantity: 1,
        stock: 150
      },
      {
        name: 'Corn Flakes',
        description: 'Breakfast cereal',
        price: 180.00,
        image: 'cornflakes.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[2].id, // BOX
        quantity: 1,
        stock: 85
      },
      {
        name: 'Milk Powder',
        description: 'Full cream milk powder',
        price: 250.00,
        image: 'milk-powder.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 70
      },
      {
        name: 'Honey',
        description: 'Pure natural honey',
        price: 220.00,
        image: 'honey.jpg',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[2].id, // BOX
        quantity: 1,
        stock: 55
      }
    ]);

    // Create packs for each category
    const packs = [];

    // Vegetables packs (Weekly and Bi-Weekly only) - 2 packs
    const vegWeeklyPack = await Pack.create({
      name: 'Vegetables Weekly Pack',
      description: 'Fresh vegetables for one week',
      categoryId: categories[0].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    packs.push(vegWeeklyPack);

    const vegBiWeeklyPack = await Pack.create({
      name: 'Vegetables Bi-Weekly Pack',
      description: 'Fresh vegetables for two weeks',
      categoryId: categories[0].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(vegBiWeeklyPack);

    // Additional vegetable packs
    const vegPremiumWeeklyPack = await Pack.create({
      name: 'Premium Vegetables Weekly Pack',
      description: 'Premium organic vegetables for one week',
      categoryId: categories[0].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 3500.00,
      finalPrice: 3500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(vegPremiumWeeklyPack);

    const vegBiWeeklyPack2 = await Pack.create({
      name: 'Vegetables Bi-Weekly Pack Plus',
      description: 'Extended vegetables for two weeks',
      categoryId: categories[0].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 6500.00,
      finalPrice: 6500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(vegBiWeeklyPack2);

    // Fruits packs (Weekly and Bi-Weekly only) - 2 packs
    const fruitWeeklyPack = await Pack.create({
      name: 'Fruits Weekly Pack',
      description: 'Fresh fruits for one week',
      categoryId: categories[1].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitWeeklyPack);

    const fruitBiWeeklyPack = await Pack.create({
      name: 'Fruits Bi-Weekly Pack',
      description: 'Fresh fruits for two weeks',
      categoryId: categories[1].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitBiWeeklyPack);

    // Additional fruit packs
    const fruitPremiumWeeklyPack = await Pack.create({
      name: 'Premium Fruits Weekly Pack',
      description: 'Premium imported fruits for one week',
      categoryId: categories[1].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 4000.00,
      finalPrice: 4000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitPremiumWeeklyPack);

    const fruitBiWeeklyPack2 = await Pack.create({
      name: 'Fruits Bi-Weekly Pack Plus',
      description: 'Extended fruits selection for two weeks',
      categoryId: categories[1].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 7500.00,
      finalPrice: 7500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitBiWeeklyPack2);

    // Groceries packs (All three types) - 3 packs
    const groceryWeeklyPack = await Pack.create({
      name: 'Groceries Weekly Pack',
      description: 'Essential groceries for one week',
      categoryId: categories[2].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryWeeklyPack);

    const groceryBiWeeklyPack = await Pack.create({
      name: 'Groceries Bi-Weekly Pack',
      description: 'Essential groceries for two weeks',
      categoryId: categories[2].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryBiWeeklyPack);

    const groceryMonthlyPack = await Pack.create({
      name: 'Groceries Monthly Pack',
      description: 'Essential groceries for one month',
      categoryId: categories[2].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryMonthlyPack);

    // Additional grocery packs
    const groceryPremiumWeeklyPack = await Pack.create({
      name: 'Premium Groceries Weekly Pack',
      description: 'Premium grocery items for one week',
      categoryId: categories[2].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 3500.00,
      finalPrice: 3500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryPremiumWeeklyPack);

    const groceryBiWeeklyPack2 = await Pack.create({
      name: 'Groceries Bi-Weekly Pack Plus',
      description: 'Extended groceries for two weeks',
      categoryId: categories[2].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 6500.00,
      finalPrice: 6500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryBiWeeklyPack2);

    const groceryMonthlyPack2 = await Pack.create({
      name: 'Groceries Monthly Pack Plus',
      description: 'Extended groceries for one month',
      categoryId: categories[2].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 15000.00,
      finalPrice: 15000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryMonthlyPack2);

    // Add products to packs
    await PackProduct.bulkCreate([
      // Vegetables Weekly Pack (vegWeeklyPack - index 0)
      { packId: vegWeeklyPack.id, productId: products[0].id, quantity: 2, unitPrice: 80.00 }, // Spinach
      { packId: vegWeeklyPack.id, productId: products[1].id, quantity: 3, unitPrice: 60.00 }, // Tomatoes
      { packId: vegWeeklyPack.id, productId: products[2].id, quantity: 2, unitPrice: 40.00 }, // Potatoes
      { packId: vegWeeklyPack.id, productId: products[3].id, quantity: 2, unitPrice: 50.00 }, // Carrots
      { packId: vegWeeklyPack.id, productId: products[4].id, quantity: 2, unitPrice: 35.00 }, // Onions

      // Vegetables Bi-Weekly Pack (vegBiWeeklyPack - index 1)
      { packId: vegBiWeeklyPack.id, productId: products[0].id, quantity: 4, unitPrice: 80.00 },
      { packId: vegBiWeeklyPack.id, productId: products[1].id, quantity: 6, unitPrice: 60.00 },
      { packId: vegBiWeeklyPack.id, productId: products[2].id, quantity: 4, unitPrice: 40.00 },
      { packId: vegBiWeeklyPack.id, productId: products[3].id, quantity: 4, unitPrice: 50.00 },
      { packId: vegBiWeeklyPack.id, productId: products[4].id, quantity: 3, unitPrice: 35.00 }, // Onions
      { packId: vegBiWeeklyPack.id, productId: products[5].id, quantity: 2, unitPrice: 90.00 }, // Bell Peppers

      // Premium Vegetables Weekly Pack (vegPremiumWeeklyPack - index 2)
      { packId: vegPremiumWeeklyPack.id, productId: products[0].id, quantity: 3, unitPrice: 80.00 }, // Spinach
      { packId: vegPremiumWeeklyPack.id, productId: products[1].id, quantity: 4, unitPrice: 60.00 }, // Tomatoes
      { packId: vegPremiumWeeklyPack.id, productId: products[2].id, quantity: 3, unitPrice: 40.00 }, // Potatoes
      { packId: vegPremiumWeeklyPack.id, productId: products[3].id, quantity: 3, unitPrice: 50.00 }, // Carrots
      { packId: vegPremiumWeeklyPack.id, productId: products[5].id, quantity: 2, unitPrice: 90.00 }, // Bell Peppers
      { packId: vegPremiumWeeklyPack.id, productId: products[6].id, quantity: 2, unitPrice: 120.00 }, // Broccoli
      { packId: vegPremiumWeeklyPack.id, productId: products[7].id, quantity: 1, unitPrice: 60.00 }, // Cauliflower

      // Vegetables Bi-Weekly Pack Plus (vegBiWeeklyPack2 - index 3)
      { packId: vegBiWeeklyPack2.id, productId: products[0].id, quantity: 6, unitPrice: 80.00 },
      { packId: vegBiWeeklyPack2.id, productId: products[1].id, quantity: 8, unitPrice: 60.00 },
      { packId: vegBiWeeklyPack2.id, productId: products[2].id, quantity: 6, unitPrice: 40.00 },
      { packId: vegBiWeeklyPack2.id, productId: products[3].id, quantity: 6, unitPrice: 50.00 },
      { packId: vegBiWeeklyPack2.id, productId: products[4].id, quantity: 5, unitPrice: 35.00 }, // Onions
      { packId: vegBiWeeklyPack2.id, productId: products[5].id, quantity: 3, unitPrice: 90.00 }, // Bell Peppers
      { packId: vegBiWeeklyPack2.id, productId: products[6].id, quantity: 3, unitPrice: 120.00 }, // Broccoli
      { packId: vegBiWeeklyPack2.id, productId: products[8].id, quantity: 2, unitPrice: 70.00 }, // Green Beans

      // Fruits Weekly Pack (fruitWeeklyPack - index 4)
      { packId: fruitWeeklyPack.id, productId: products[10].id, quantity: 6, unitPrice: 50.00 }, // Bananas
      { packId: fruitWeeklyPack.id, productId: products[11].id, quantity: 4, unitPrice: 120.00 }, // Apples
      { packId: fruitWeeklyPack.id, productId: products[12].id, quantity: 4, unitPrice: 80.00 }, // Oranges
      { packId: fruitWeeklyPack.id, productId: products[13].id, quantity: 2, unitPrice: 150.00 }, // Mangoes

      // Fruits Bi-Weekly Pack (fruitBiWeeklyPack - index 5)
      { packId: fruitBiWeeklyPack.id, productId: products[10].id, quantity: 12, unitPrice: 50.00 },
      { packId: fruitBiWeeklyPack.id, productId: products[11].id, quantity: 8, unitPrice: 120.00 },
      { packId: fruitBiWeeklyPack.id, productId: products[12].id, quantity: 8, unitPrice: 80.00 },
      { packId: fruitBiWeeklyPack.id, productId: products[13].id, quantity: 4, unitPrice: 150.00 }, // Mangoes
      { packId: fruitBiWeeklyPack.id, productId: products[14].id, quantity: 3, unitPrice: 100.00 }, // Grapes

      // Premium Fruits Weekly Pack (fruitPremiumWeeklyPack - index 6)
      { packId: fruitPremiumWeeklyPack.id, productId: products[10].id, quantity: 8, unitPrice: 50.00 }, // Bananas
      { packId: fruitPremiumWeeklyPack.id, productId: products[11].id, quantity: 6, unitPrice: 120.00 }, // Apples
      { packId: fruitPremiumWeeklyPack.id, productId: products[12].id, quantity: 6, unitPrice: 80.00 }, // Oranges
      { packId: fruitPremiumWeeklyPack.id, productId: products[14].id, quantity: 4, unitPrice: 100.00 }, // Grapes
      { packId: fruitPremiumWeeklyPack.id, productId: products[15].id, quantity: 2, unitPrice: 200.00 }, // Strawberries
      { packId: fruitPremiumWeeklyPack.id, productId: products[16].id, quantity: 1, unitPrice: 80.00 }, // Pineapple

      // Fruits Bi-Weekly Pack Plus (fruitBiWeeklyPack2 - index 7)
      { packId: fruitBiWeeklyPack2.id, productId: products[10].id, quantity: 16, unitPrice: 50.00 },
      { packId: fruitBiWeeklyPack2.id, productId: products[11].id, quantity: 12, unitPrice: 120.00 },
      { packId: fruitBiWeeklyPack2.id, productId: products[12].id, quantity: 12, unitPrice: 80.00 },
      { packId: fruitBiWeeklyPack2.id, productId: products[13].id, quantity: 6, unitPrice: 150.00 }, // Mangoes
      { packId: fruitBiWeeklyPack2.id, productId: products[14].id, quantity: 6, unitPrice: 100.00 }, // Grapes
      { packId: fruitBiWeeklyPack2.id, productId: products[15].id, quantity: 4, unitPrice: 200.00 }, // Strawberries
      { packId: fruitBiWeeklyPack2.id, productId: products[16].id, quantity: 2, unitPrice: 80.00 }, // Pineapple
      { packId: fruitBiWeeklyPack2.id, productId: products[17].id, quantity: 1, unitPrice: 40.00 }, // Watermelon

      // Groceries Weekly Pack (groceryWeeklyPack - index 8)
      { packId: groceryWeeklyPack.id, productId: products[20].id, quantity: 2, unitPrice: 80.00 }, // Rice
      { packId: groceryWeeklyPack.id, productId: products[21].id, quantity: 1, unitPrice: 60.00 }, // Flour
      { packId: groceryWeeklyPack.id, productId: products[22].id, quantity: 1, unitPrice: 150.00 }, // Oil
      { packId: groceryWeeklyPack.id, productId: products[23].id, quantity: 1, unitPrice: 50.00 }, // Sugar
      { packId: groceryWeeklyPack.id, productId: products[24].id, quantity: 1, unitPrice: 20.00 }, // Salt
      { packId: groceryWeeklyPack.id, productId: products[25].id, quantity: 1, unitPrice: 200.00 }, // Tea

      // Groceries Bi-Weekly Pack (groceryBiWeeklyPack - index 9)
      { packId: groceryBiWeeklyPack.id, productId: products[20].id, quantity: 4, unitPrice: 80.00 },
      { packId: groceryBiWeeklyPack.id, productId: products[21].id, quantity: 2, unitPrice: 60.00 },
      { packId: groceryBiWeeklyPack.id, productId: products[22].id, quantity: 2, unitPrice: 150.00 },
      { packId: groceryBiWeeklyPack.id, productId: products[23].id, quantity: 2, unitPrice: 50.00 },
      { packId: groceryBiWeeklyPack.id, productId: products[24].id, quantity: 2, unitPrice: 20.00 }, // Salt
      { packId: groceryBiWeeklyPack.id, productId: products[25].id, quantity: 2, unitPrice: 200.00 }, // Tea
      { packId: groceryBiWeeklyPack.id, productId: products[26].id, quantity: 1, unitPrice: 300.00 }, // Coffee

      // Groceries Monthly Pack (groceryMonthlyPack - index 10)
      { packId: groceryMonthlyPack.id, productId: products[20].id, quantity: 8, unitPrice: 80.00 },
      { packId: groceryMonthlyPack.id, productId: products[21].id, quantity: 4, unitPrice: 60.00 },
      { packId: groceryMonthlyPack.id, productId: products[22].id, quantity: 4, unitPrice: 150.00 },
      { packId: groceryMonthlyPack.id, productId: products[23].id, quantity: 4, unitPrice: 50.00 },
      { packId: groceryMonthlyPack.id, productId: products[24].id, quantity: 4, unitPrice: 20.00 }, // Salt
      { packId: groceryMonthlyPack.id, productId: products[25].id, quantity: 4, unitPrice: 200.00 }, // Tea
      { packId: groceryMonthlyPack.id, productId: products[26].id, quantity: 2, unitPrice: 300.00 }, // Coffee
      { packId: groceryMonthlyPack.id, productId: products[27].id, quantity: 2, unitPrice: 120.00 }, // Masala

      // Premium Groceries Weekly Pack (groceryPremiumWeeklyPack - index 11)
      { packId: groceryPremiumWeeklyPack.id, productId: products[20].id, quantity: 3, unitPrice: 80.00 }, // Rice
      { packId: groceryPremiumWeeklyPack.id, productId: products[21].id, quantity: 2, unitPrice: 60.00 }, // Flour
      { packId: groceryPremiumWeeklyPack.id, productId: products[22].id, quantity: 2, unitPrice: 150.00 }, // Oil
      { packId: groceryPremiumWeeklyPack.id, productId: products[23].id, quantity: 2, unitPrice: 50.00 }, // Sugar
      { packId: groceryPremiumWeeklyPack.id, productId: products[24].id, quantity: 2, unitPrice: 20.00 }, // Salt
      { packId: groceryPremiumWeeklyPack.id, productId: products[25].id, quantity: 2, unitPrice: 200.00 }, // Tea
      { packId: groceryPremiumWeeklyPack.id, productId: products[26].id, quantity: 2, unitPrice: 300.00 }, // Coffee
      { packId: groceryPremiumWeeklyPack.id, productId: products[27].id, quantity: 1, unitPrice: 120.00 }, // Masala
      { packId: groceryPremiumWeeklyPack.id, productId: products[28].id, quantity: 1, unitPrice: 90.00 }, // Lentils

      // Groceries Bi-Weekly Pack Plus (groceryBiWeeklyPack2 - index 12)
      { packId: groceryBiWeeklyPack2.id, productId: products[20].id, quantity: 6, unitPrice: 80.00 },
      { packId: groceryBiWeeklyPack2.id, productId: products[21].id, quantity: 3, unitPrice: 60.00 },
      { packId: groceryBiWeeklyPack2.id, productId: products[22].id, quantity: 3, unitPrice: 150.00 },
      { packId: groceryBiWeeklyPack2.id, productId: products[23].id, quantity: 3, unitPrice: 50.00 },
      { packId: groceryBiWeeklyPack2.id, productId: products[24].id, quantity: 3, unitPrice: 20.00 }, // Salt
      { packId: groceryBiWeeklyPack2.id, productId: products[25].id, quantity: 3, unitPrice: 200.00 }, // Tea
      { packId: groceryBiWeeklyPack2.id, productId: products[26].id, quantity: 2, unitPrice: 300.00 }, // Coffee
      { packId: groceryBiWeeklyPack2.id, productId: products[27].id, quantity: 2, unitPrice: 120.00 }, // Masala
      { packId: groceryBiWeeklyPack2.id, productId: products[28].id, quantity: 2, unitPrice: 90.00 }, // Lentils
      { packId: groceryBiWeeklyPack2.id, productId: products[29].id, quantity: 1, unitPrice: 85.00 }, // Pasta

      // Groceries Monthly Pack Plus (groceryMonthlyPack2 - index 13)
      { packId: groceryMonthlyPack2.id, productId: products[20].id, quantity: 12, unitPrice: 80.00 },
      { packId: groceryMonthlyPack2.id, productId: products[21].id, quantity: 6, unitPrice: 60.00 },
      { packId: groceryMonthlyPack2.id, productId: products[22].id, quantity: 6, unitPrice: 150.00 },
      { packId: groceryMonthlyPack2.id, productId: products[23].id, quantity: 6, unitPrice: 50.00 },
      { packId: groceryMonthlyPack2.id, productId: products[24].id, quantity: 6, unitPrice: 20.00 }, // Salt
      { packId: groceryMonthlyPack2.id, productId: products[25].id, quantity: 6, unitPrice: 200.00 }, // Tea
      { packId: groceryMonthlyPack2.id, productId: products[26].id, quantity: 4, unitPrice: 300.00 }, // Coffee
      { packId: groceryMonthlyPack2.id, productId: products[27].id, quantity: 4, unitPrice: 120.00 }, // Masala
      { packId: groceryMonthlyPack2.id, productId: products[28].id, quantity: 4, unitPrice: 90.00 }, // Lentils
      { packId: groceryMonthlyPack2.id, productId: products[29].id, quantity: 2, unitPrice: 85.00 }, // Pasta
      { packId: groceryMonthlyPack2.id, productId: products[30].id, quantity: 2, unitPrice: 95.00 }, // Ketchup
      { packId: groceryMonthlyPack2.id, productId: products[31].id, quantity: 2, unitPrice: 65.00 }, // Biscuits
      { packId: groceryMonthlyPack2.id, productId: products[32].id, quantity: 1, unitPrice: 180.00 }, // Corn Flakes
      { packId: groceryMonthlyPack2.id, productId: products[33].id, quantity: 1, unitPrice: 250.00 }, // Milk Powder
      { packId: groceryMonthlyPack2.id, productId: products[34].id, quantity: 1, unitPrice: 220.00 }, // Honey
    ]);

    console.log('Database seeded successfully!');
    console.log(`Created ${users.length} users, ${categories.length} categories, ${unitTypes.length} unit types, ${products.length} products, ${packTypes.length} pack types, and ${packs.length} packs`);
    console.log(`Pack breakdown: ${packs.filter(p => p.categoryId === categories[0].id).length} vegetable packs, ${packs.filter(p => p.categoryId === categories[1].id).length} fruit packs, ${packs.filter(p => p.categoryId === categories[2].id).length} grocery packs`);

    return { users, categories, unitTypes, products, packTypes, packs };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

module.exports = seedDatabase;