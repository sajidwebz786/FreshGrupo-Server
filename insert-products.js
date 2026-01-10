require('dotenv').config();

async function insertProducts() {
  try {
    const models = require('./models/index');
    const { Product, UnitType, Category } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    await models.sequelize.sync();
    console.log('Database synced.');

    // First, ensure unit types exist
    const unitTypes = [
      { name: 'Kilogram', abbreviation: 'KG', description: 'Weight in kilograms' },
      { name: 'Piece', abbreviation: 'PC', description: 'Individual pieces' },
      { name: '500 Grams', abbreviation: '500G', description: '500 grams pack' },
      { name: 'Bottle', abbreviation: 'BTL', description: 'Bottled items' }
    ];

    const existingUnitTypes = await UnitType.count();
    let unitTypeRecords = [];
    if (existingUnitTypes === 0) {
      unitTypeRecords = await UnitType.bulkCreate(unitTypes);
      console.log('Unit types inserted.');
    } else {
      unitTypeRecords = await UnitType.findAll();
      console.log('Unit types already exist.');
    }

    // Get categories
    const categories = await Category.findAll();
    console.log(`Found ${categories.length} categories.`);

    const existingProducts = await Product.count();
    if (existingProducts > 0) {
      console.log(`Products already exist: ${existingProducts}`);
      return;
    }

    // Sample products for each category
    const productsData = [
      // Fruits Pack (categoryId: 1)
      { name: 'Bananas', description: 'Sweet and ripe bananas', price: 55.00, image: 'bananas.png', categoryId: 1, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 200 },
      { name: 'Apples', description: 'Crisp and juicy apples', price: 200.00, image: 'apples.png', categoryId: 1, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 100 },
      { name: 'Oranges', description: 'Sweet oranges', price: 70.00, image: 'oranges.png', categoryId: 1, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 150 },

      // Vegetables Pack (categoryId: 2)
      { name: 'Spinach', description: 'Organic spinach leaves', price: 50.00, image: 'spinach.png', categoryId: 2, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 100 },
      { name: 'Tomatoes', description: 'Vine-ripened tomatoes', price: 30.00, image: 'tomatoes.png', categoryId: 2, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 150 },
      { name: 'Potatoes', description: 'Fresh potatoes', price: 25.00, image: 'potatoes.png', categoryId: 2, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 200 },

      // Grocery Pack (categoryId: 3)
      { name: 'Rice 5kg', description: 'Premium quality rice', price: 300.00, image: 'rice.png', categoryId: 3, unitTypeId: unitTypeRecords[1].id, quantity: 1, stock: 50 },
      { name: 'Flour', description: 'Wheat flour', price: 340.00, image: 'flour.png', categoryId: 3, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 120 },
      { name: 'Oil', description: 'Cooking oil', price: 850.00, image: 'oil.png', categoryId: 3, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 80 },

      // Juices Pack (categoryId: 4)
      { name: 'Orange Juice', description: 'Fresh orange juice', price: 120.00, image: 'orange-juice.png', categoryId: 4, unitTypeId: unitTypeRecords[3].id, quantity: 1, stock: 100 },
      { name: 'Apple Juice', description: 'Pure apple juice', price: 110.00, image: 'apple-juice.png', categoryId: 4, unitTypeId: unitTypeRecords[3].id, quantity: 1, stock: 90 },

      // Millets Pack (categoryId: 5)
      { name: 'Foxtail Millet', description: 'Healthy foxtail millet', price: 410.00, image: 'foxtail-millet.png', categoryId: 5, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 60 },
      { name: 'Bajra', description: 'Bajra grains', price: 330.00, image: 'bajra.png', categoryId: 5, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 70 },

      // Raw Powder Pack (categoryId: 6)
      { name: 'Turmeric', description: 'Turmeric powder', price: 450.00, image: 'turmeric.png', categoryId: 6, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 100 },
      { name: 'Red Chili', description: 'Red chili powder', price: 500.00, image: 'chili-powder.png', categoryId: 6, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 90 },

      // Nutrition Pack (categoryId: 7)
      { name: 'Whey Protein', description: 'Protein supplement', price: 2500.00, image: 'whey-protein.png', categoryId: 7, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 30 },
      { name: 'Multivitamin', description: 'Daily multivitamin', price: 800.00, image: 'multivitamin.png', categoryId: 7, unitTypeId: unitTypeRecords[1].id, quantity: 1, stock: 50 },

      // Dry Fruit Pack (categoryId: 8)
      { name: 'Almonds', description: 'Premium almonds', price: 530.00, image: 'almonds.png', categoryId: 8, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 80 },
      { name: 'Cashews', description: 'Whole cashews', price: 460.00, image: 'cashews.png', categoryId: 8, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 70 },

      // Festival Pack (categoryId: 9)
      { name: 'Sweets Mix', description: 'Festival sweets', price: 750.00, image: 'sweets.png', categoryId: 9, unitTypeId: unitTypeRecords[0].id, quantity: 1, stock: 40 },
      { name: 'Incense Sticks', description: 'Aromatic incense', price: 250.00, image: 'incense.png', categoryId: 9, unitTypeId: unitTypeRecords[1].id, quantity: 1, stock: 60 },

      // Flower Pack (categoryId: 10)
      { name: 'Rose Bouquet', description: 'Fresh roses', price: 500.00, image: 'roses.png', categoryId: 10, unitTypeId: unitTypeRecords[1].id, quantity: 1, stock: 25 },
      { name: 'Lily Bouquet', description: 'White lilies', price: 420.00, image: 'lilies.png', categoryId: 10, unitTypeId: unitTypeRecords[1].id, quantity: 1, stock: 30 },

      // Sprouts Pack (categoryId: 11)
      { name: 'Mung Sprouts', description: 'Fresh mung sprouts', price: 60.00, image: 'mung-sprouts.png', categoryId: 11, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 80 },
      { name: 'Chickpea Sprouts', description: 'Chickpea sprouts', price: 70.00, image: 'chickpea-sprouts.png', categoryId: 11, unitTypeId: unitTypeRecords[2].id, quantity: 1, stock: 70 }
    ];

    await Product.bulkCreate(productsData);
    console.log(`Inserted ${productsData.length} products.`);

    await models.sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

insertProducts();