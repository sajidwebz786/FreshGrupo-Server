const bcrypt = require('bcrypt');

// Initialize database and models when run directly
let modelsInitialized = false;
let User, Category, Product, UnitType, PackType, Pack, PackProduct;

async function initializeModels() {
  if (!modelsInitialized) {
    const sequelize = require('../config/database');

    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Load models
    const models = require('../models/index');
    User = models.User;
    Category = models.Category;
    Product = models.Product;
    UnitType = models.UnitType;
    PackType = models.PackType;
    Pack = models.Pack;
    PackProduct = models.PackProduct;

    // Sync database
    await sequelize.sync();
    console.log('Database synced.');

    modelsInitialized = true;
  }
  return require('../config/database');
}

async function seedDatabase(force = false) {
  try {
    // Initialize models if not already done
    const sequelize = await initializeModels();

    if (force) {
      // Force seeding: drop and recreate all tables to flush existing data
      console.log('Force seeding: flushing existing data...');
      // Drop all tables in the public schema
      await sequelize.query(`
        DO $$ DECLARE
             r RECORD;
         BEGIN
             FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                 EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
             END LOOP;
         END $$;
      `);
      console.log('Existing data flushed.');
      // Re-sync after dropping
      await sequelize.sync();
      console.log('Database re-synced.');
    } else {
      // Just sync without dropping
      await sequelize.sync();
      console.log('Database synced.');
    }

    console.log('Seeding database...');

    // Check if data already exists
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('Data already exists, skipping seeding.');
      return { users: [], categories: [], unitTypes: [], products: [], packTypes: [], packs: [] };
    }

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
        name: '500 Grams',
        abbreviation: '500G',
        description: '500 grams pack'
      },
      {
        name: '250 Grams',
        abbreviation: '250G',
        description: '250 grams pack'
      },
      {
        name: '100 Grams',
        abbreviation: '100G',
        description: '100 grams pack'
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
        name: 'Pack of 6',
        abbreviation: 'PK6',
        description: 'Pack containing 6 pieces'
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
        name: '500ml',
        abbreviation: '500ML',
        description: '500 milliliters'
      },
      {
        name: 'Packet',
        abbreviation: 'PKT',
        description: 'Packaged items'
      },
      {
        name: 'Small Pack',
        abbreviation: 'SPKT',
        description: 'Small packaged items'
      },
      {
        name: 'Large Pack',
        abbreviation: 'LPKT',
        description: 'Large packaged items'
      },
      {
        name: 'Bottle',
        abbreviation: 'BTL',
        description: 'Bottled items'
      },
      {
        name: 'Can',
        abbreviation: 'CAN',
        description: 'Canned items'
      },
      {
        name: 'Sachet',
        abbreviation: 'SCH',
        description: 'Small sachets or packets'
      },
      {
        name: 'Jar',
        abbreviation: 'JAR',
        description: 'Jarred items'
      },
      {
        name: 'Tube',
        abbreviation: 'TUBE',
        description: 'Tubed items'
      },
      {
        name: 'Carton',
        abbreviation: 'CTN',
        description: 'Carton packaging'
      },
      {
        name: 'Bundle',
        abbreviation: 'BDL',
        description: 'Bundled items'
      }
    ]);

    // Create 11 categories matching the pack names exactly
    const categories = await Category.bulkCreate([
      {
        name: 'Fruits Pack',
        description: 'Fresh fruits and seasonal produce',
        image: 'fruits-pack.jpg'
      },
      {
        name: 'Vegetables Pack',
        description: 'Fresh vegetables and greens',
        image: 'vegetables-pack.jpg'
      },
      {
        name: 'Grocery Pack',
        description: 'Essential grocery items and staples',
        image: 'grocery-pack.jpg'
      },
      {
        name: 'Juices Pack',
        description: 'Fresh fruit juices and beverages',
        image: 'juices-pack.jpg'
      },
      {
        name: 'Millets Pack',
        description: 'Healthy millets and grains',
        image: 'millets-pack.jpg'
      },
      {
        name: 'Raw Powder Pack',
        description: 'Raw spices and powder ingredients',
        image: 'raw-powder-pack.jpg'
      },
      {
        name: 'Nutrition Pack',
        description: 'Nutritional supplements and health products',
        image: 'nutrition-pack.jpg'
      },
      {
        name: 'Dry Fruit Pack',
        description: 'Dried fruits and nuts',
        image: 'dry-fruit-pack.jpg'
      },
      {
        name: 'Festival Pack',
        description: 'Festival special items and sweets',
        image: 'festival-pack.jpg'
      },
      {
        name: 'Flower Pack',
        description: 'Fresh flowers and bouquets',
        image: 'flower-pack.jpg'
      },
      {
        name: 'Sprouts Pack',
        description: 'Fresh sprouts and microgreens',
        image: 'sprouts-pack.jpg'
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
        name: 'Spinach',
        description: 'Organic baby spinach leaves',
        price: 50.00,
        image: 'spinach.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 100
      },
      {
        name: 'Tomatoes',
        description: 'Vine-ripened red tomatoes',
        price: 30.00,
        image: 'tomatoes.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 150
      },
      {
        name: 'Potatoes',
        description: 'Fresh farm potatoes',
        price: 25.00,
        image: 'potatoes.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 200
      },
      {
        name: 'Carrots',
        description: 'Crisp orange carrots',
        price: 60.00,
        image: 'carrots.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 120
      },
      {
        name: 'Onions',
        description: 'Red and white onions',
        price: 60.00,
        image: 'onions.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 180
      },
      {
        name: 'Bell Peppers',
        description: 'Colorful bell peppers',
        price: 90.00,
        image: 'bell-peppers.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 80
      },
      {
        name: 'Broccoli',
        description: 'Fresh green broccoli',
        price: 120.00,
        image: 'broccoli.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 70
      },
      {
        name: 'Cauliflower',
        description: 'Fresh cauliflower heads',
        price: 60.00,
        image: 'cauliflower.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[6].id, // PC - sold individually
        quantity: 1,
        stock: 90
      },
      {
        name: 'Green Beans',
        description: 'Fresh green beans',
        price: 70.00,
        image: 'green-beans.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[0].id, // KG - bulk vegetable
        quantity: 1,
        stock: 110
      },
      {
        name: 'Cabbage',
        description: 'Fresh green cabbage',
        price: 45.00,
        image: 'cabbage.png',
        categoryId: categories[1].id, // Vegetables Pack
        unitTypeId: unitTypes[6].id, // PC - sold individually
        quantity: 1,
        stock: 130
      },

      // Fruits (10 products)
      {
        name: 'Bananas',
        description: 'Sweet and ripe bananas',
        price: 55.00,
        image: 'bananas.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 200
      },
      {
        name: 'Apples',
        description: 'Crisp and juicy organic apples',
        price: 200.00,
        image: 'apples.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 100
      },
      {
        name: 'Oranges',
        description: 'Sweet and juicy oranges',
        price: 70.00,
        image: 'oranges.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 150
      },
      {
        name: 'Mangoes',
        description: 'Sweet seasonal mangoes',
        price: 150.00,
        image: 'mangoes.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        isAvailable: false,
        stock: 80
      },
      {
        name: 'Grapes',
        description: 'Fresh seedless grapes',
        price: 160.00,
        image: 'grapes.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 90
      },
      {
        name: 'Strawberries',
        description: 'Sweet strawberries',
        price: 200.00,
        image: 'strawberries.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[2].id, // BOX
        quantity: 1,
        stock: 60
      },
      {
        name: 'Pineapple',
        description: 'Fresh tropical pineapple',
        price: 80.00,
        image: 'pineapple.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[3].id, // PC
        quantity: 1,
        stock: 70
      },
      {
        name: 'Watermelon',
        description: 'Refreshing watermelon',
        price: 40.00,
        image: 'watermelon.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[3].id, // PC
        quantity: 1,
        stock: 50
      },
      {
        name: 'Papaya',
        description: 'Ripe papaya fruit',
        price: 60.00,
        image: 'papaya.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 85
      },
      {
        name: 'Kiwi',
        description: 'Fresh kiwi fruit',
        price: 180.00,
        image: 'kiwi.png',
        categoryId: categories[0].id, // Fruits Pack
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 65
      },

      // Groceries (15 products)
      {
        name: 'Rice 5kg',
        description: 'Premium quality rice - 5kg pack',
        price: 300.00,
        image: 'rice-5kg.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PC - piece (pack)
        quantity: 1,
        stock: 50
      },
      {
        name: 'Rice 10kg',
        description: 'Premium quality rice - 10kg pack',
        price: 600.00,
        image: 'rice-10kg.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PC - piece (pack)
        quantity: 1,
        stock: 30
      },
      {
        name: 'Rice 25kg',
        description: 'Premium quality rice - 25kg pack',
        price: 1500.00,
        image: 'rice-25kg.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[6].id, // PC - piece (pack)
        quantity: 1,
        stock: 20
      },
      {
        name: 'Flour',
        description: 'Fresh wheat flour',
        price: 340.00,
        image: 'flour.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG - bulk flour
        quantity: 1,
        stock: 120
      },
      {
        name: 'Oil',
        description: 'Pure cooking oil',
        price: 850.00,
        image: 'oil.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[11].id, // 500ml - liquid in bottle
        quantity: 1,
        stock: 80
      },
      {
        name: 'Sugar',
        description: 'Refined white sugar',
        price: 50.00,
        image: 'sugar.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG - bulk sugar
        quantity: 1,
        stock: 150
      },
      {
        name: 'Salt',
        description: 'Iodized salt',
        price: 30.00,
        image: 'salt.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG - bulk salt
        quantity: 1,
        stock: 200
      },
      {
        name: 'Tea',
        description: 'Premium tea leaves',
        price: 325.00,
        image: 'tea.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[2].id, // 500 Grams - packaged tea
        quantity: 1,
        stock: 60
      },
      {
        name: 'Coffee',
        description: 'Rich coffee powder',
        price: 5750.00,
        image: 'coffee.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[2].id, // 500 Grams - packaged coffee
        quantity: 1,
        stock: 45
      },
      {
        name: 'Masala',
        description: 'Mixed spice blend',
        price: 120.00,
        image: 'masala.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[12].id, // PKT - packaged spices
        quantity: 1,
        stock: 90
      },
      {
        name: 'Dal',
        description: 'Assorted lentils',
        price: 180.00,
        image: 'lentils.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[0].id, // KG - bulk lentils
        quantity: 1,
        stock: 110
      },
      {
        name: 'Pasta',
        description: 'Italian pasta',
        price: 85.00,
        image: 'pasta.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[12].id, // PKT - packaged pasta
        quantity: 1,
        stock: 75
      },
      {
        name: 'Ketchup',
        description: 'Tangy tomato sauce',
        price: 95.00,
        image: 'ketchup.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[16].id, // BTL - bottled sauce
        quantity: 1,
        stock: 130
      },
      {
        name: 'Biscuits',
        description: 'Assorted biscuits',
        price: 65.00,
        image: 'biscuits.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[13].id, // Small Pack - packaged biscuits
        quantity: 1,
        stock: 150
      },
      {
        name: 'Cornflakes',
        description: 'Breakfast cereal',
        price: 180.00,
        image: 'cornflakes.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[5].id, // BOX - boxed cereal
        quantity: 1,
        stock: 85
      },
      {
        name: 'Milk Powder',
        description: 'Full cream milk powder',
        price: 250.00,
        image: 'milk-powder.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[3].id, // 250 Grams - packaged powder
        quantity: 1,
        stock: 70
      },
      {
        name: 'Honey',
        description: 'Pure natural honey',
        price: 220.00,
        image: 'honey.png',
        categoryId: categories[2].id,
        unitTypeId: unitTypes[16].id, // BTL - bottled honey
        quantity: 1,
        stock: 55
      },

      // Juices (5 products)
      {
        name: 'Orange Juice',
        description: 'Fresh orange juice',
        price: 120.00,
        image: 'orange-juice.png',
        categoryId: categories[3].id,
        unitTypeId: unitTypes[16].id, // BTL
        quantity: 1,
        stock: 100
      },
      {
        name: 'Apple Juice',
        description: 'Pure apple juice',
        price: 110.00,
        image: 'apple-juice.png',
        categoryId: categories[3].id,
        unitTypeId: unitTypes[16].id, // BTL
        quantity: 1,
        stock: 90
      },
      {
        name: 'Mango Juice',
        description: 'Sweet mango juice',
        price: 130.00,
        image: 'mango-juice.png',
        categoryId: categories[3].id,
        unitTypeId: unitTypes[16].id, // BTL
        quantity: 1,
        stock: 80
      },
      {
        name: 'Mixed Fruit Juice',
        description: 'Blend of seasonal fruits',
        price: 140.00,
        image: 'mixed-juice.png',
        categoryId: categories[3].id,
        unitTypeId: unitTypes[16].id, // BTL
        quantity: 1,
        stock: 70
      },
      {
        name: 'Pineapple Juice',
        description: 'Tropical pineapple juice',
        price: 125.00,
        image: 'pineapple-juice.png',
        categoryId: categories[3].id,
        unitTypeId: unitTypes[16].id, // BTL
        quantity: 1,
        stock: 85
      },

      // Millets (5 products)
      {
        name: 'Foxtail Millet',
        description: 'Nutritious foxtail millet',
        price: 410.00,
        image: 'foxtail-millet.jpg',
        categoryId: categories[4].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 60
      },
      {
        name: 'Bajra',
        description: 'Healthy bajra grains',
        price: 330.00,
        image: 'bajra.jpg',
        categoryId: categories[4].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 70
      },
      {
        name: 'Ragi',
        description: 'Finger millet',
        price: 350.00,
        image: 'ragi.jpg',
        categoryId: categories[4].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 65
      },
      {
        name: 'Jowar',
        description: 'Sorghum grains',
        price: 300.00,
        image: 'jowar.jpg',
        categoryId: categories[4].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 75
      },
      {
        name: 'Barley',
        description: 'Pearl barley',
        price: 380.00,
        image: 'barley.jpg',
        categoryId: categories[4].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 55
      },

      // Raw Powder (5 products)
      {
        name: 'Turmeric',
        description: 'Pure turmeric powder',
        price: 450.00,
        image: 'turmeric.png',
        categoryId: categories[5].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 100
      },
      {
        name: 'Red Chili',
        description: 'Spicy red chili powder',
        price: 500.00,
        image: 'chili-powder.png',
        categoryId: categories[5].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 90
      },
      {
        name: 'Coriander',
        description: 'Ground coriander seeds',
        price: 400.00,
        image: 'coriander.png',
        categoryId: categories[5].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 110
      },
      {
        name: 'Cardamom',
        description: 'Aromatic cardamom',
        price: 600.00,
        image: 'cardamom.png',
        categoryId: categories[5].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 85
      },
      {
        name: 'Cloves',
        description: 'Whole cloves',
        price: 550.00,
        image: 'cloves.png',
        categoryId: categories[5].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 75
      },

      // Nutrition (5 products)
      {
        name: 'Whey Protein',
        description: 'Whey protein supplement',
        price: 2500.00,
        image: 'whey-protein.png',
        categoryId: categories[6].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 30
      },
      {
        name: 'Multivitamin',
        description: 'Daily multivitamin',
        price: 800.00,
        image: 'multivitamin.png',
        categoryId: categories[6].id,
        unitTypeId: unitTypes[13].id, // Small Pack
        quantity: 1,
        stock: 50
      },
      {
        name: 'Omega 3',
        description: 'Fish oil capsules',
        price: 1200.00,
        image: 'omega3.png',
        categoryId: categories[6].id,
        unitTypeId: unitTypes[13].id, // Small Pack
        quantity: 1,
        stock: 40
      },
      {
        name: 'Vitamin D',
        description: 'Vitamin D supplement',
        price: 600.00,
        image: 'vitamind.png',
        categoryId: categories[6].id,
        unitTypeId: unitTypes[13].id, // Small Pack
        quantity: 1,
        stock: 60
      },
      {
        name: 'Calcium',
        description: 'Bone health supplement',
        price: 500.00,
        image: 'calcium.png',
        categoryId: categories[6].id,
        unitTypeId: unitTypes[13].id, // Small Pack
        quantity: 1,
        stock: 45
      },

      // Dry Fruit (5 products)
      {
        name: 'Almonds',
        description: 'Premium almonds',
        price: 530.00,
        image: 'almonds.png',
        categoryId: categories[7].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 80
      },
      {
        name: 'Cashews',
        description: 'Whole cashews',
        price: 460.00,
        image: 'cashews.png',
        categoryId: categories[7].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 70
      },
      {
        name: 'Walnuts',
        description: 'Fresh walnuts',
        price: 590.00,
        image: 'walnuts.png',
        categoryId: categories[7].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 60
      },
      {
        name: 'Raisins',
        description: 'Golden raisins',
        price: 260.00,
        image: 'raisins.png',
        categoryId: categories[7].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 90
      },
      {
        name: 'Pistachios',
        description: 'Shelled pistachios',
        price: 660.00,
        image: 'pistachios.png',
        categoryId: categories[7].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 50
      },

      // Festival (5 products)
      {
        name: 'Sweets Mix',
        description: 'Assorted festival sweets',
        price: 750.00,
        image: 'sweets.png',
        categoryId: categories[8].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 40
      },
      {
        name: 'Festival Snacks',
        description: 'Traditional festival snacks',
        price: 625.00,
        image: 'snacks.png',
        categoryId: categories[8].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 50
      },
      {
        name: 'Decorative Items',
        description: 'Festival decorations',
        price: 375.00,
        image: 'decorations.png',
        categoryId: categories[8].id,
        unitTypeId: unitTypes[13].id, // Small Pack
        quantity: 1,
        stock: 30
      },
      {
        name: 'Incense Sticks',
        description: 'Aromatic incense',
        price: 250.00,
        image: 'incense.png',
        categoryId: categories[8].id,
        unitTypeId: unitTypes[13].id, // Small Pack
        quantity: 1,
        stock: 60
      },
      {
        name: 'Festival Fruits',
        description: 'Seasonal festival fruits',
        price: 500.00,
        image: 'festival-fruits.png',
        categoryId: categories[8].id,
        unitTypeId: unitTypes[0].id, // KG
        quantity: 1,
        stock: 45
      },

      // Flower (5 products)
      {
        name: 'Rose Bouquet',
        description: 'Fresh red roses',
        price: 500.00,
        image: 'roses.png',
        categoryId: categories[9].id,
        unitTypeId: unitTypes[9].id, // Bunch
        quantity: 1,
        stock: 25
      },
      {
        name: 'Lily Bouquet',
        description: 'White lilies',
        price: 420.00,
        image: 'lilies.png',
        categoryId: categories[9].id,
        unitTypeId: unitTypes[9].id, // Bunch
        quantity: 1,
        stock: 30
      },
      {
        name: 'Tulip Mix',
        description: 'Colorful tulips',
        price: 580.00,
        image: 'tulips.png',
        categoryId: categories[9].id,
        unitTypeId: unitTypes[9].id, // Bunch
        quantity: 1,
        stock: 20
      },
      {
        name: 'Orchid Plant',
        description: 'Potted orchid',
        price: 670.00,
        image: 'orchid.png',
        categoryId: categories[9].id,
        unitTypeId: unitTypes[6].id, // PC
        quantity: 1,
        stock: 15
      },
      {
        name: 'Mixed Flowers',
        description: 'Seasonal flower mix',
        price: 330.00,
        image: 'mixed-flowers.png',
        categoryId: categories[9].id,
        unitTypeId: unitTypes[9].id, // Bunch
        quantity: 1,
        stock: 35
      },

      // Sprouts (5 products)
      {
        name: 'Mung Sprouts',
        description: 'Fresh mung sprouts',
        price: 60.00,
        image: 'mung-sprouts.png',
        categoryId: categories[10].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 80
      },
      {
        name: 'Chickpea Sprouts',
        description: 'Nutritious chickpea sprouts',
        price: 70.00,
        image: 'chickpea-sprouts.png',
        categoryId: categories[10].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 70
      },
      {
        name: 'Alfalfa Sprouts',
        description: 'Organic alfalfa sprouts',
        price: 80.00,
        image: 'alfalfa-sprouts.png',
        categoryId: categories[10].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 60
      },
      {
        name: 'Radish Sprouts',
        description: 'Crunchy radish sprouts',
        price: 65.00,
        image: 'radish-sprouts.png',
        categoryId: categories[10].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 75
      },
      {
        name: 'Mixed Sprouts',
        description: 'Blend of healthy sprouts',
        price: 75.00,
        image: 'mixed-sprouts.png',
        categoryId: categories[10].id,
        unitTypeId: unitTypes[2].id, // 500G
        quantity: 1,
        stock: 65
      }
    ]);

    // Create packs for each category
    const packs = [];

    // Vegetables packs (Weekly, Bi-Weekly, Monthly)
    const vegWeeklyPack = await Pack.create({
      name: 'Vegetables Weekly Pack',
      description: 'Fresh vegetables for one week',
      categoryId: categories[1].id, // Vegetables Pack
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
      categoryId: categories[1].id, // Vegetables Pack
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(vegBiWeeklyPack);

    const vegMonthlyPack = await Pack.create({
      name: 'Vegetables Monthly Pack',
      description: 'Fresh vegetables for one month',
      categoryId: categories[1].id, // Vegetables Pack
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(vegMonthlyPack);

    // Fruits packs (Weekly, Bi-Weekly, Monthly)
    const fruitsPack = await Pack.create({
      name: 'Fruits Pack',
      description: 'Fresh fruits for one week',
      categoryId: categories[0].id, // Fruits Pack
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitsPack);

    const fruitBiWeeklyPack = await Pack.create({
      name: 'Fruits Bi-Weekly Pack',
      description: 'Fresh fruits for two weeks',
      categoryId: categories[0].id, // Fruits Pack
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitBiWeeklyPack);

    const fruitMonthlyPack = await Pack.create({
      name: 'Fruits Monthly Pack',
      description: 'Fresh fruits for one month',
      categoryId: categories[0].id, // Fruits Pack
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(fruitMonthlyPack);

    // Groceries packs (All three types)
    const groceryPack = await Pack.create({
      name: 'Grocery Pack',
      description: 'Essential groceries for one week',
      categoryId: categories[2].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(groceryPack);

    const groceryWeeklyPack = await Pack.create({
      name: 'Groceries Weekly Pack',
      description: 'Essential groceries for one week',
      categoryId: categories[2].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 60 * 1000)
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
      basePrice: 4875.00,
      finalPrice: 4875.00,
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

    // Juices packs (Weekly, Bi-Weekly, Monthly)
    const juicesWeeklyPack = await Pack.create({
      name: 'Juices Weekly Pack',
      description: 'Fresh fruit juices for one week',
      categoryId: categories[3].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2960.00,
      finalPrice: 2960.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(juicesWeeklyPack);

    const juicesBiWeeklyPack = await Pack.create({
      name: 'Juices Bi-Weekly Pack',
      description: 'Fresh fruit juices for two weeks',
      categoryId: categories[3].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(juicesBiWeeklyPack);

    const juicesMonthlyPack = await Pack.create({
      name: 'Juices Monthly Pack',
      description: 'Fresh fruit juices for one month',
      categoryId: categories[3].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(juicesMonthlyPack);

    // Millets packs (Weekly, Bi-Weekly, Monthly)
    const milletsWeeklyPack = await Pack.create({
      name: 'Millets Weekly Pack',
      description: 'Healthy millets for one week',
      categoryId: categories[4].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(milletsWeeklyPack);

    const milletsBiWeeklyPack = await Pack.create({
      name: 'Millets Bi-Weekly Pack',
      description: 'Healthy millets for two weeks',
      categoryId: categories[4].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(milletsBiWeeklyPack);

    const milletsMonthlyPack = await Pack.create({
      name: 'Millets Monthly Pack',
      description: 'Healthy millets for one month',
      categoryId: categories[4].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(milletsMonthlyPack);

    // Raw Powder packs (Weekly, Bi-Weekly, Monthly)
    const rawPowderWeeklyPack = await Pack.create({
      name: 'Raw Powder Weekly Pack',
      description: 'Essential raw spices for one week',
      categoryId: categories[5].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(rawPowderWeeklyPack);

    const rawPowderBiWeeklyPack = await Pack.create({
      name: 'Raw Powder Bi-Weekly Pack',
      description: 'Essential raw spices for two weeks',
      categoryId: categories[5].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(rawPowderBiWeeklyPack);

    const rawPowderMonthlyPack = await Pack.create({
      name: 'Raw Powder Monthly Pack',
      description: 'Essential raw spices for one month',
      categoryId: categories[5].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(rawPowderMonthlyPack);

    // Nutrition packs (Weekly, Bi-Weekly, Monthly)
    const nutritionWeeklyPack = await Pack.create({
      name: 'Nutrition Weekly Pack',
      description: 'Nutritional supplements for one week',
      categoryId: categories[6].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 5600.00,
      finalPrice: 5600.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(nutritionWeeklyPack);

    const nutritionBiWeeklyPack = await Pack.create({
      name: 'Nutrition Bi-Weekly Pack',
      description: 'Nutritional supplements for two weeks',
      categoryId: categories[6].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 11200.00,
      finalPrice: 11200.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(nutritionBiWeeklyPack);

    const nutritionMonthlyPack = await Pack.create({
      name: 'Nutrition Monthly Pack',
      description: 'Nutritional supplements for one month',
      categoryId: categories[6].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 22400.00,
      finalPrice: 22400.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(nutritionMonthlyPack);

    // Dry Fruit packs (Weekly, Bi-Weekly, Monthly)
    const dryFruitWeeklyPack = await Pack.create({
      name: 'Dry Fruit Weekly Pack',
      description: 'Premium dry fruits for one week',
      categoryId: categories[7].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(dryFruitWeeklyPack);

    const dryFruitBiWeeklyPack = await Pack.create({
      name: 'Dry Fruit Bi-Weekly Pack',
      description: 'Premium dry fruits for two weeks',
      categoryId: categories[7].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(dryFruitBiWeeklyPack);

    const dryFruitMonthlyPack = await Pack.create({
      name: 'Dry Fruit Monthly Pack',
      description: 'Premium dry fruits for one month',
      categoryId: categories[7].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(dryFruitMonthlyPack);

    // Festival packs (Weekly, Bi-Weekly, Monthly)
    const festivalWeeklyPack = await Pack.create({
      name: 'Festival Weekly Pack',
      description: 'Festival items for one week',
      categoryId: categories[8].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(festivalWeeklyPack);

    const festivalBiWeeklyPack = await Pack.create({
      name: 'Festival Bi-Weekly Pack',
      description: 'Festival items for two weeks',
      categoryId: categories[8].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(festivalBiWeeklyPack);

    const festivalMonthlyPack = await Pack.create({
      name: 'Festival Monthly Pack',
      description: 'Festival items for one month',
      categoryId: categories[8].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(festivalMonthlyPack);

    // Flower packs (Weekly, Bi-Weekly, Monthly)
    const flowerWeeklyPack = await Pack.create({
      name: 'Flower Weekly Pack',
      description: 'Fresh flowers for one week',
      categoryId: categories[9].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(flowerWeeklyPack);

    const flowerBiWeeklyPack = await Pack.create({
      name: 'Flower Bi-Weekly Pack',
      description: 'Fresh flowers for two weeks',
      categoryId: categories[9].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(flowerBiWeeklyPack);

    const flowerMonthlyPack = await Pack.create({
      name: 'Flower Monthly Pack',
      description: 'Fresh flowers for one month',
      categoryId: categories[9].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(flowerMonthlyPack);

    // Sprouts packs (Weekly, Bi-Weekly, Monthly)
    const sproutsWeeklyPack = await Pack.create({
      name: 'Sprouts Weekly Pack',
      description: 'Fresh sprouts for one week',
      categoryId: categories[10].id,
      packTypeId: packTypes[0].id, // Weekly
      basePrice: 2500.00,
      finalPrice: 2500.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(sproutsWeeklyPack);

    const sproutsBiWeeklyPack = await Pack.create({
      name: 'Sprouts Bi-Weekly Pack',
      description: 'Fresh sprouts for two weeks',
      categoryId: categories[10].id,
      packTypeId: packTypes[1].id, // Bi-Weekly
      basePrice: 5000.00,
      finalPrice: 5000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(sproutsBiWeeklyPack);

    const sproutsMonthlyPack = await Pack.create({
      name: 'Sprouts Monthly Pack',
      description: 'Fresh sprouts for one month',
      categoryId: categories[10].id,
      packTypeId: packTypes[2].id, // Monthly
      basePrice: 10000.00,
      finalPrice: 10000.00,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    packs.push(sproutsMonthlyPack);

    // Add products to packs - assign products to all packs
    await PackProduct.bulkCreate([
      // Vegetables packs
      { packId: vegWeeklyPack.id, productId: products[0].id, quantity: 2, unitPrice: 50.00 }, // Spinach
      { packId: vegWeeklyPack.id, productId: products[1].id, quantity: 3, unitPrice: products[1].price }, // Tomatoes
      { packId: vegWeeklyPack.id, productId: products[2].id, quantity: 2, unitPrice: 70.00 }, // Potatoes
      { packId: vegWeeklyPack.id, productId: products[3].id, quantity: 2, unitPrice: 250.00 }, // Carrots
      { packId: vegWeeklyPack.id, productId: products[4].id, quantity: 2, unitPrice: 60.00 }, // Onions

      { packId: vegBiWeeklyPack.id, productId: products[0].id, quantity: 4, unitPrice: 150.00 }, // Spinach
      { packId: vegBiWeeklyPack.id, productId: products[1].id, quantity: 6, unitPrice: 50.00 }, // Tomatoes
      { packId: vegBiWeeklyPack.id, productId: products[2].id, quantity: 4, unitPrice: 70.00 }, // Potatoes
      { packId: vegBiWeeklyPack.id, productId: products[3].id, quantity: 4, unitPrice: 250.00 }, // Carrots
      { packId: vegBiWeeklyPack.id, productId: products[4].id, quantity: 4, unitPrice: 60.00 }, // Onions

      { packId: vegMonthlyPack.id, productId: products[0].id, quantity: 8, unitPrice: 150.00 }, // Spinach
      { packId: vegMonthlyPack.id, productId: products[1].id, quantity: 12, unitPrice: 50.00 }, // Tomatoes
      { packId: vegMonthlyPack.id, productId: products[2].id, quantity: 8, unitPrice: 70.00 }, // Potatoes
      { packId: vegMonthlyPack.id, productId: products[3].id, quantity: 8, unitPrice: 250.00 }, // Carrots
      { packId: vegMonthlyPack.id, productId: products[4].id, quantity: 8, unitPrice: 60.00 }, // Onions

      // Fruits packs
      { packId: fruitsPack.id, productId: products[10].id, quantity: 6, unitPrice: 55.00 }, // Bananas
      { packId: fruitsPack.id, productId: products[11].id, quantity: 4, unitPrice: 200.00 }, // Apples
      { packId: fruitsPack.id, productId: products[12].id, quantity: 4, unitPrice: 70.00 }, // Oranges
      { packId: fruitsPack.id, productId: products[13].id, quantity: 2, unitPrice: 150.00 }, // Mangoes
      { packId: fruitsPack.id, productId: products[14].id, quantity: 3, unitPrice: 160.00 }, // Grapes

      { packId: fruitBiWeeklyPack.id, productId: products[10].id, quantity: 12, unitPrice: 55.00 }, // Bananas
      { packId: fruitBiWeeklyPack.id, productId: products[11].id, quantity: 8, unitPrice: 200.00 }, // Apples
      { packId: fruitBiWeeklyPack.id, productId: products[12].id, quantity: 8, unitPrice: 70.00 }, // Oranges
      { packId: fruitBiWeeklyPack.id, productId: products[13].id, quantity: 4, unitPrice: 150.00 }, // Mangoes
      { packId: fruitBiWeeklyPack.id, productId: products[14].id, quantity: 6, unitPrice: 160.00 }, // Grapes

      { packId: fruitMonthlyPack.id, productId: products[10].id, quantity: 24, unitPrice: 55.00 }, // Bananas
      { packId: fruitMonthlyPack.id, productId: products[11].id, quantity: 16, unitPrice: 200.00 }, // Apples
      { packId: fruitMonthlyPack.id, productId: products[12].id, quantity: 16, unitPrice: 70.00 }, // Oranges
      { packId: fruitMonthlyPack.id, productId: products[13].id, quantity: 8, unitPrice: 150.00 }, // Mangoes
      { packId: fruitMonthlyPack.id, productId: products[14].id, quantity: 12, unitPrice: 160.00 }, // Grapes

      // Grocery packs
      { packId: groceryPack.id, productId: products[20].id, quantity: 2, unitPrice: 300.00 }, // Rice
      { packId: groceryPack.id, productId: products[21].id, quantity: 1, unitPrice: 340.00 }, // Flour
      { packId: groceryPack.id, productId: products[22].id, quantity: 1, unitPrice: 850.00 }, // Oil
      { packId: groceryPack.id, productId: products[23].id, quantity: 1, unitPrice: 50.00 }, // Sugar
      { packId: groceryPack.id, productId: products[24].id, quantity: 1, unitPrice: 30.00 }, // Salt

      { packId: groceryWeeklyPack.id, productId: products[20].id, quantity: 2, unitPrice: 300.00 }, // Rice
      { packId: groceryWeeklyPack.id, productId: products[21].id, quantity: 1, unitPrice: 340.00 }, // Flour
      { packId: groceryWeeklyPack.id, productId: products[22].id, quantity: 1, unitPrice: 850.00 }, // Oil
      { packId: groceryWeeklyPack.id, productId: products[23].id, quantity: 1, unitPrice: 50.00 }, // Sugar
      { packId: groceryWeeklyPack.id, productId: products[24].id, quantity: 1, unitPrice: 30.00 }, // Salt

      { packId: groceryBiWeeklyPack.id, productId: products[20].id, quantity: 6, unitPrice: 300.00 }, // Rice
      { packId: groceryBiWeeklyPack.id, productId: products[21].id, quantity: 3, unitPrice: 340.00 }, // Flour
      { packId: groceryBiWeeklyPack.id, productId: products[22].id, quantity: 3, unitPrice: 850.00 }, // Oil
      { packId: groceryBiWeeklyPack.id, productId: products[23].id, quantity: 3, unitPrice: 50.00 }, // Sugar
      { packId: groceryBiWeeklyPack.id, productId: products[24].id, quantity: 3, unitPrice: 30.00 }, // Salt
      { packId: groceryBiWeeklyPack.id, productId: products[25].id, quantity: 2, unitPrice: 325.00 }, // Tea
      { packId: groceryBiWeeklyPack.id, productId: products[26].id, quantity: 1, unitPrice: 5750.00 }, // Coffee

      { packId: groceryMonthlyPack.id, productId: products[20].id, quantity: 10, unitPrice: 300.00 }, // Rice
      { packId: groceryMonthlyPack.id, productId: products[21].id, quantity: 5, unitPrice: 340.00 }, // Flour
      { packId: groceryMonthlyPack.id, productId: products[22].id, quantity: 5, unitPrice: 850.00 }, // Oil
      { packId: groceryMonthlyPack.id, productId: products[23].id, quantity: 5, unitPrice: 50.00 }, // Sugar
      { packId: groceryMonthlyPack.id, productId: products[24].id, quantity: 5, unitPrice: 30.00 }, // Salt
      { packId: groceryMonthlyPack.id, productId: products[25].id, quantity: 4, unitPrice: 325.00 }, // Tea
      { packId: groceryMonthlyPack.id, productId: products[26].id, quantity: 2, unitPrice: 5750.00 }, // Coffee
      { packId: groceryMonthlyPack.id, productId: products[27].id, quantity: 3, unitPrice: 65.00 }, // Biscuits
      { packId: groceryMonthlyPack.id, productId: products[28].id, quantity: 2, unitPrice: 180.00 }, // Corn Flakes
      { packId: groceryMonthlyPack.id, productId: products[29].id, quantity: 2, unitPrice: 250.00 }, // Milk Powder
      { packId: groceryMonthlyPack.id, productId: products[30].id, quantity: 1, unitPrice: 220.00 }, // Honey

      // Juices packs
      { packId: juicesWeeklyPack.id, productId: products[35].id, quantity: 6, unitPrice: 120.00 }, // Orange Juice
      { packId: juicesWeeklyPack.id, productId: products[36].id, quantity: 6, unitPrice: 110.00 }, // Apple Juice
      { packId: juicesWeeklyPack.id, productId: products[37].id, quantity: 4, unitPrice: 130.00 }, // Mango Juice
      { packId: juicesWeeklyPack.id, productId: products[38].id, quantity: 4, unitPrice: 140.00 }, // Mixed Fruit Juice
      { packId: juicesWeeklyPack.id, productId: products[39].id, quantity: 4, unitPrice: 125.00 }, // Pineapple Juice

      { packId: juicesBiWeeklyPack.id, productId: products[35].id, quantity: 12, unitPrice: 120.00 }, // Orange Juice
      { packId: juicesBiWeeklyPack.id, productId: products[36].id, quantity: 12, unitPrice: 110.00 }, // Apple Juice
      { packId: juicesBiWeeklyPack.id, productId: products[37].id, quantity: 8, unitPrice: 130.00 }, // Mango Juice
      { packId: juicesBiWeeklyPack.id, productId: products[38].id, quantity: 8, unitPrice: 140.00 }, // Mixed Fruit Juice
      { packId: juicesBiWeeklyPack.id, productId: products[39].id, quantity: 8, unitPrice: 125.00 }, // Pineapple Juice

      { packId: juicesMonthlyPack.id, productId: products[35].id, quantity: 24, unitPrice: 120.00 }, // Orange Juice
      { packId: juicesMonthlyPack.id, productId: products[36].id, quantity: 24, unitPrice: 110.00 }, // Apple Juice
      { packId: juicesMonthlyPack.id, productId: products[37].id, quantity: 16, unitPrice: 130.00 }, // Mango Juice
      { packId: juicesMonthlyPack.id, productId: products[38].id, quantity: 16, unitPrice: 140.00 }, // Mixed Fruit Juice
      { packId: juicesMonthlyPack.id, productId: products[39].id, quantity: 16, unitPrice: 125.00 }, // Pineapple Juice

      // Millets packs
      { packId: milletsWeeklyPack.id, productId: products[40].id, quantity: 2, unitPrice: 150.00 }, // Foxtail Millet
      { packId: milletsWeeklyPack.id, productId: products[41].id, quantity: 2, unitPrice: 120.00 }, // Bajra
      { packId: milletsWeeklyPack.id, productId: products[42].id, quantity: 1, unitPrice: 130.00 }, // Ragi
      { packId: milletsWeeklyPack.id, productId: products[43].id, quantity: 1, unitPrice: 110.00 }, // Jowar
      { packId: milletsWeeklyPack.id, productId: products[44].id, quantity: 1, unitPrice: 140.00 }, // Barley

      { packId: milletsBiWeeklyPack.id, productId: products[40].id, quantity: 4, unitPrice: 150.00 }, // Foxtail Millet
      { packId: milletsBiWeeklyPack.id, productId: products[41].id, quantity: 4, unitPrice: 120.00 }, // Bajra
      { packId: milletsBiWeeklyPack.id, productId: products[42].id, quantity: 2, unitPrice: 130.00 }, // Ragi
      { packId: milletsBiWeeklyPack.id, productId: products[43].id, quantity: 2, unitPrice: 110.00 }, // Jowar
      { packId: milletsBiWeeklyPack.id, productId: products[44].id, quantity: 2, unitPrice: 140.00 }, // Barley

      { packId: milletsMonthlyPack.id, productId: products[40].id, quantity: 8, unitPrice: 150.00 }, // Foxtail Millet
      { packId: milletsMonthlyPack.id, productId: products[41].id, quantity: 8, unitPrice: 120.00 }, // Bajra
      { packId: milletsMonthlyPack.id, productId: products[42].id, quantity: 4, unitPrice: 130.00 }, // Ragi
      { packId: milletsMonthlyPack.id, productId: products[43].id, quantity: 4, unitPrice: 110.00 }, // Jowar
      { packId: milletsMonthlyPack.id, productId: products[44].id, quantity: 4, unitPrice: 140.00 }, // Barley

      // Raw Powder packs
      { packId: rawPowderWeeklyPack.id, productId: products[45].id, quantity: 1, unitPrice: 80.00 }, // Turmeric Powder
      { packId: rawPowderWeeklyPack.id, productId: products[46].id, quantity: 1, unitPrice: 90.00 }, // Red Chili Powder
      { packId: rawPowderWeeklyPack.id, productId: products[47].id, quantity: 1, unitPrice: 70.00 }, // Coriander Powder
      { packId: rawPowderWeeklyPack.id, productId: products[48].id, quantity: 1, unitPrice: 85.00 }, // Cumin Powder
      { packId: rawPowderWeeklyPack.id, productId: products[49].id, quantity: 1, unitPrice: 120.00 }, // Garam Masala

      { packId: rawPowderBiWeeklyPack.id, productId: products[45].id, quantity: 2, unitPrice: 80.00 }, // Turmeric Powder
      { packId: rawPowderBiWeeklyPack.id, productId: products[46].id, quantity: 2, unitPrice: 90.00 }, // Red Chili Powder
      { packId: rawPowderBiWeeklyPack.id, productId: products[47].id, quantity: 2, unitPrice: 70.00 }, // Coriander Powder
      { packId: rawPowderBiWeeklyPack.id, productId: products[48].id, quantity: 2, unitPrice: 85.00 }, // Cumin Powder
      { packId: rawPowderBiWeeklyPack.id, productId: products[49].id, quantity: 2, unitPrice: 120.00 }, // Garam Masala

      { packId: rawPowderMonthlyPack.id, productId: products[45].id, quantity: 4, unitPrice: 80.00 }, // Turmeric Powder
      { packId: rawPowderMonthlyPack.id, productId: products[46].id, quantity: 4, unitPrice: 90.00 }, // Red Chili Powder
      { packId: rawPowderMonthlyPack.id, productId: products[47].id, quantity: 4, unitPrice: 70.00 }, // Coriander Powder
      { packId: rawPowderMonthlyPack.id, productId: products[48].id, quantity: 4, unitPrice: 85.00 }, // Cumin Powder
      { packId: rawPowderMonthlyPack.id, productId: products[49].id, quantity: 4, unitPrice: 120.00 }, // Garam Masala

      // Nutrition packs
      { packId: nutritionWeeklyPack.id, productId: products[50].id, quantity: 1, unitPrice: 2500.00 }, // Protein Powder
      { packId: nutritionWeeklyPack.id, productId: products[51].id, quantity: 1, unitPrice: 800.00 }, // Multivitamin
      { packId: nutritionWeeklyPack.id, productId: products[52].id, quantity: 1, unitPrice: 1200.00 }, // Omega-3
      { packId: nutritionWeeklyPack.id, productId: products[53].id, quantity: 1, unitPrice: 600.00 }, // Vitamin D3
      { packId: nutritionWeeklyPack.id, productId: products[54].id, quantity: 1, unitPrice: 500.00 }, // Calcium

      { packId: nutritionBiWeeklyPack.id, productId: products[50].id, quantity: 2, unitPrice: 2500.00 }, // Protein Powder
      { packId: nutritionBiWeeklyPack.id, productId: products[51].id, quantity: 2, unitPrice: 800.00 }, // Multivitamin
      { packId: nutritionBiWeeklyPack.id, productId: products[52].id, quantity: 2, unitPrice: 1200.00 }, // Omega-3
      { packId: nutritionBiWeeklyPack.id, productId: products[53].id, quantity: 2, unitPrice: 600.00 }, // Vitamin D3
      { packId: nutritionBiWeeklyPack.id, productId: products[54].id, quantity: 2, unitPrice: 500.00 }, // Calcium

      { packId: nutritionMonthlyPack.id, productId: products[50].id, quantity: 4, unitPrice: 2500.00 }, // Protein Powder
      { packId: nutritionMonthlyPack.id, productId: products[51].id, quantity: 4, unitPrice: 800.00 }, // Multivitamin
      { packId: nutritionMonthlyPack.id, productId: products[52].id, quantity: 4, unitPrice: 1200.00 }, // Omega-3
      { packId: nutritionMonthlyPack.id, productId: products[53].id, quantity: 4, unitPrice: 600.00 }, // Vitamin D3
      { packId: nutritionMonthlyPack.id, productId: products[54].id, quantity: 4, unitPrice: 500.00 }, // Calcium

      // Dry Fruit packs
      { packId: dryFruitWeeklyPack.id, productId: products[55].id, quantity: 1, unitPrice: 400.00 }, // Almonds
      { packId: dryFruitWeeklyPack.id, productId: products[56].id, quantity: 1, unitPrice: 350.00 }, // Cashews
      { packId: dryFruitWeeklyPack.id, productId: products[57].id, quantity: 1, unitPrice: 450.00 }, // Walnuts
      { packId: dryFruitWeeklyPack.id, productId: products[58].id, quantity: 1, unitPrice: 200.00 }, // Raisins
      { packId: dryFruitWeeklyPack.id, productId: products[59].id, quantity: 1, unitPrice: 500.00 }, // Pistachios

      { packId: dryFruitBiWeeklyPack.id, productId: products[55].id, quantity: 2, unitPrice: 400.00 }, // Almonds
      { packId: dryFruitBiWeeklyPack.id, productId: products[56].id, quantity: 2, unitPrice: 350.00 }, // Cashews
      { packId: dryFruitBiWeeklyPack.id, productId: products[57].id, quantity: 2, unitPrice: 450.00 }, // Walnuts
      { packId: dryFruitBiWeeklyPack.id, productId: products[58].id, quantity: 2, unitPrice: 200.00 }, // Raisins
      { packId: dryFruitBiWeeklyPack.id, productId: products[59].id, quantity: 2, unitPrice: 500.00 }, // Pistachios

      { packId: dryFruitMonthlyPack.id, productId: products[55].id, quantity: 4, unitPrice: 400.00 }, // Almonds
      { packId: dryFruitMonthlyPack.id, productId: products[56].id, quantity: 4, unitPrice: 350.00 }, // Cashews
      { packId: dryFruitMonthlyPack.id, productId: products[57].id, quantity: 4, unitPrice: 450.00 }, // Walnuts
      { packId: dryFruitMonthlyPack.id, productId: products[58].id, quantity: 4, unitPrice: 200.00 }, // Raisins
      { packId: dryFruitMonthlyPack.id, productId: products[59].id, quantity: 4, unitPrice: 500.00 }, // Pistachios

      // Festival packs
      { packId: festivalWeeklyPack.id, productId: products[60].id, quantity: 1, unitPrice: 300.00 }, // Sweets Mix
      { packId: festivalWeeklyPack.id, productId: products[61].id, quantity: 1, unitPrice: 250.00 }, // Festival Snacks
      { packId: festivalWeeklyPack.id, productId: products[62].id, quantity: 1, unitPrice: 150.00 }, // Decorative Items
      { packId: festivalWeeklyPack.id, productId: products[63].id, quantity: 1, unitPrice: 100.00 }, // Incense Sticks
      { packId: festivalWeeklyPack.id, productId: products[64].id, quantity: 1, unitPrice: 200.00 }, // Festival Fruits

      { packId: festivalBiWeeklyPack.id, productId: products[60].id, quantity: 2, unitPrice: 300.00 }, // Sweets Mix
      { packId: festivalBiWeeklyPack.id, productId: products[61].id, quantity: 2, unitPrice: 250.00 }, // Festival Snacks
      { packId: festivalBiWeeklyPack.id, productId: products[62].id, quantity: 2, unitPrice: 150.00 }, // Decorative Items
      { packId: festivalBiWeeklyPack.id, productId: products[63].id, quantity: 2, unitPrice: 100.00 }, // Incense Sticks
      { packId: festivalBiWeeklyPack.id, productId: products[64].id, quantity: 2, unitPrice: 200.00 }, // Festival Fruits

      { packId: festivalMonthlyPack.id, productId: products[60].id, quantity: 4, unitPrice: 300.00 }, // Sweets Mix
      { packId: festivalMonthlyPack.id, productId: products[61].id, quantity: 4, unitPrice: 250.00 }, // Festival Snacks
      { packId: festivalMonthlyPack.id, productId: products[62].id, quantity: 4, unitPrice: 150.00 }, // Decorative Items
      { packId: festivalMonthlyPack.id, productId: products[63].id, quantity: 4, unitPrice: 100.00 }, // Incense Sticks
      { packId: festivalMonthlyPack.id, productId: products[64].id, quantity: 4, unitPrice: 200.00 }, // Festival Fruits

      // Flower packs
      { packId: flowerWeeklyPack.id, productId: products[65].id, quantity: 1, unitPrice: 300.00 }, // Rose Bouquet
      { packId: flowerWeeklyPack.id, productId: products[66].id, quantity: 1, unitPrice: 250.00 }, // Lily Bouquet
      { packId: flowerWeeklyPack.id, productId: products[67].id, quantity: 1, unitPrice: 350.00 }, // Tulip Mix
      { packId: flowerWeeklyPack.id, productId: products[68].id, quantity: 1, unitPrice: 400.00 }, // Orchid Plant
      { packId: flowerWeeklyPack.id, productId: products[69].id, quantity: 1, unitPrice: 200.00 }, // Mixed Flowers

      { packId: flowerBiWeeklyPack.id, productId: products[65].id, quantity: 2, unitPrice: 300.00 }, // Rose Bouquet
      { packId: flowerBiWeeklyPack.id, productId: products[66].id, quantity: 2, unitPrice: 250.00 }, // Lily Bouquet
      { packId: flowerBiWeeklyPack.id, productId: products[67].id, quantity: 2, unitPrice: 350.00 }, // Tulip Mix
      { packId: flowerBiWeeklyPack.id, productId: products[68].id, quantity: 2, unitPrice: 400.00 }, // Orchid Plant
      { packId: flowerBiWeeklyPack.id, productId: products[69].id, quantity: 2, unitPrice: 200.00 }, // Mixed Flowers

      { packId: flowerMonthlyPack.id, productId: products[65].id, quantity: 4, unitPrice: 300.00 }, // Rose Bouquet
      { packId: flowerMonthlyPack.id, productId: products[66].id, quantity: 4, unitPrice: 250.00 }, // Lily Bouquet
      { packId: flowerMonthlyPack.id, productId: products[67].id, quantity: 4, unitPrice: 350.00 }, // Tulip Mix
      { packId: flowerMonthlyPack.id, productId: products[68].id, quantity: 4, unitPrice: 400.00 }, // Orchid Plant
      { packId: flowerMonthlyPack.id, productId: products[69].id, quantity: 4, unitPrice: 200.00 }, // Mixed Flowers

      // Sprouts packs
      { packId: sproutsWeeklyPack.id, productId: products[70].id, quantity: 2, unitPrice: 60.00 }, // Mung Bean Sprouts
      { packId: sproutsWeeklyPack.id, productId: products[71].id, quantity: 2, unitPrice: 70.00 }, // Chickpea Sprouts
      { packId: sproutsWeeklyPack.id, productId: products[72].id, quantity: 1, unitPrice: 80.00 }, // Alfalfa Sprouts
      { packId: sproutsWeeklyPack.id, productId: products[73].id, quantity: 1, unitPrice: 65.00 }, // Radish Sprouts
      { packId: sproutsWeeklyPack.id, productId: products[74].id, quantity: 1, unitPrice: 75.00 }, // Mixed Sprouts

      { packId: sproutsBiWeeklyPack.id, productId: products[70].id, quantity: 4, unitPrice: 60.00 }, // Mung Bean Sprouts
      { packId: sproutsBiWeeklyPack.id, productId: products[71].id, quantity: 4, unitPrice: 70.00 }, // Chickpea Sprouts
      { packId: sproutsBiWeeklyPack.id, productId: products[72].id, quantity: 2, unitPrice: 80.00 }, // Alfalfa Sprouts
      { packId: sproutsBiWeeklyPack.id, productId: products[73].id, quantity: 2, unitPrice: 65.00 }, // Radish Sprouts
      { packId: sproutsBiWeeklyPack.id, productId: products[74].id, quantity: 2, unitPrice: 75.00 }, // Mixed Sprouts

      { packId: sproutsMonthlyPack.id, productId: products[70].id, quantity: 8, unitPrice: 60.00 }, // Mung Bean Sprouts
      { packId: sproutsMonthlyPack.id, productId: products[71].id, quantity: 8, unitPrice: 70.00 }, // Chickpea Sprouts
      { packId: sproutsMonthlyPack.id, productId: products[72].id, quantity: 4, unitPrice: 80.00 }, // Alfalfa Sprouts
      { packId: sproutsMonthlyPack.id, productId: products[73].id, quantity: 4, unitPrice: 65.00 }, // Radish Sprouts
      { packId: sproutsMonthlyPack.id, productId: products[74].id, quantity: 4, unitPrice: 75.00 }, // Mixed Sprouts
    ]);

    // Calculate and update pack prices based on sum of product subtotals
    for (const pack of packs) {
      const packProducts = await PackProduct.findAll({ where: { packId: pack.id } });
      const total = packProducts.reduce((sum, pp) => sum + (pp.unitPrice * pp.quantity), 0);
      await pack.update({ finalPrice: total, basePrice: total });
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${users.length} users, ${categories.length} categories, ${unitTypes.length} unit types, ${products.length} products, ${packTypes.length} pack types, and ${packs.length} packs`);
    console.log(`Pack breakdown: ${packs.filter(p => p.categoryId === categories[1].id).length} vegetable packs, ${packs.filter(p => p.categoryId === categories[0].id).length} fruit packs, ${packs.filter(p => p.categoryId === categories[2].id).length} grocery packs, ${packs.filter(p => p.categoryId === categories[3].id).length} juice packs, and more`);

    return { users, categories, unitTypes, products, packTypes, packs };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  console.log('🌱 Running database seeding...');
  seedDatabase(true)
    .then((result) => {
      console.log('✅ Database seeding completed successfully!');
      console.log('📊 Seeded data includes:');
      console.log('   - Users: 3 (customer, admin, delivery)');
      console.log(`   - Categories: ${result.categories.length} (Fruits Pack, Vegetables Pack, Grocery Pack, Juices Pack, Millets Pack, Raw Powder Pack, Nutrition Pack, Dry Fruit Pack, Festival Pack, Flower Pack, Sprouts Pack)`);
      console.log('   - Unit Types: 15 (KG, 500G, Pack of 6, etc.)');
      console.log('   - Products: 35 (with realistic unit types)');
      console.log('   - Packs: 14 (weekly/bi-weekly/monthly)');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;













