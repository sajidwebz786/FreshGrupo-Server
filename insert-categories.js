require('dotenv').config();

async function insertCategories() {
  try {
    const models = require('./models/index');
    const { Category } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    await models.sequelize.sync();
    console.log('Database synced.');

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

    const existing = await Category.count();
    if (existing > 0) {
      console.log(`Categories already exist: ${existing}`);
      return;
    }

    await Category.bulkCreate(categories);
    console.log('Categories inserted successfully.');

    await models.sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

insertCategories();