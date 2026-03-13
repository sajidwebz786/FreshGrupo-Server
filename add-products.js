/**
 * FreshGrupo - Add Products, PackTypes and Packs
 */

require('dotenv').config();
const db = require('./models');

async function addData() {
  try {
    console.log('🔌 Connecting...');
    await db.sequelize.authenticate();

    // Get categories dynamically
    const categories = await db.Category.findAll({ order: [['id', 'ASC']] });
    console.log('✅ Found', categories.length, 'categories');

    // Get unit types
    const kg = await db.UnitType.findOne({ where: { abbreviation: 'KG' } });
    const g500 = await db.UnitType.findOne({ where: { abbreviation: '500G' } });
    const pc = await db.UnitType.findOne({ where: { abbreviation: 'PC' } });
    const l = await db.UnitType.findOne({ where: { abbreviation: 'L' } });
    const dz = await db.UnitType.findOne({ where: { abbreviation: 'DZ' } });
    const pkt = await db.UnitType.findOne({ where: { abbreviation: 'PKT' } });
    console.log('✅ Unit types found');

    // Create products using dynamic category IDs
    const products = [
      // Fruits (Category index 0)
      { name: 'Apple', price: 90, categoryId: categories[0].id, unitTypeId: kg?.id, quantity: 0.5, stock: 100 },
      { name: 'Banana', price: 25, categoryId: categories[0].id, unitTypeId: dz?.id, quantity: 1, stock: 200 },
      { name: 'Orange', price: 40, categoryId: categories[0].id, unitTypeId: kg?.id, quantity: 0.5, stock: 150 },
      { name: 'Sweet Lime', price: 35, categoryId: categories[0].id, unitTypeId: kg?.id, quantity: 0.5, stock: 120 },
      { name: 'Pomegranate', price: 80, categoryId: categories[0].id, unitTypeId: kg?.id, quantity: 0.5, stock: 80 },
      { name: 'Papaya', price: 40, categoryId: categories[0].id, unitTypeId: pc?.id, quantity: 1, stock: 100 },
      { name: 'Guava', price: 35, categoryId: categories[0].id, unitTypeId: kg?.id, quantity: 0.5, stock: 90 },
      { name: 'Grapes', price: 45, categoryId: categories[0].id, unitTypeId: kg?.id, quantity: 0.5, stock: 100 },

      // Vegetables (Category index 1)
      { name: 'Tomato', price: 40, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 1, stock: 200 },
      { name: 'Potato', price: 30, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 1, stock: 300 },
      { name: 'Onion', price: 40, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 1, stock: 250 },
      { name: 'Carrot', price: 30, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 0.5, stock: 150 },
      { name: 'Cabbage', price: 40, categoryId: categories[1].id, unitTypeId: pc?.id, quantity: 1, stock: 120 },
      { name: 'Spinach', price: 30, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 0.25, stock: 100 },
      { name: 'Green Chili', price: 40, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 0.25, stock: 150 },
      { name: 'Ginger', price: 60, categoryId: categories[1].id, unitTypeId: kg?.id, quantity: 0.25, stock: 100 },

      // Grocery (Category index 2)
      { name: 'Basmati Rice', price: 350, categoryId: categories[2].id, unitTypeId: kg?.id, quantity: 5, stock: 100 },
      { name: 'Toor Dal', price: 220, categoryId: categories[2].id, unitTypeId: kg?.id, quantity: 1, stock: 150 },
      { name: 'Atta', price: 340, categoryId: categories[2].id, unitTypeId: kg?.id, quantity: 10, stock: 200 },
      { name: 'Refined Oil', price: 850, categoryId: categories[2].id, unitTypeId: l?.id, quantity: 5, stock: 150 },
      { name: 'Sugar', price: 45, categoryId: categories[2].id, unitTypeId: kg?.id, quantity: 1, stock: 200 },
      { name: 'Salt', price: 25, categoryId: categories[2].id, unitTypeId: kg?.id, quantity: 1, stock: 300 },
      { name: 'Turmeric Powder', price: 225, categoryId: categories[2].id, unitTypeId: g500?.id, quantity: 0.5, stock: 150 },

      // Juices (Category index 3)
      { name: 'Orange Juice', price: 150, categoryId: categories[3].id, unitTypeId: l?.id, quantity: 1, stock: 100 },
      { name: 'Apple Juice', price: 140, categoryId: categories[3].id, unitTypeId: l?.id, quantity: 1, stock: 100 },
      { name: 'Mango Juice', price: 180, categoryId: categories[3].id, unitTypeId: l?.id, quantity: 1, stock: 80 },
      { name: 'Grape Juice', price: 130, categoryId: categories[3].id, unitTypeId: l?.id, quantity: 1, stock: 80 },
      { name: 'Pomegranate Juice', price: 200, categoryId: categories[3].id, unitTypeId: l?.id, quantity: 1, stock: 60 },

      // Millets (Category index 4)
      { name: 'Foxtail Millet', price: 120, categoryId: categories[4].id, unitTypeId: kg?.id, quantity: 1, stock: 80 },
      { name: 'Little Millet', price: 110, categoryId: categories[4].id, unitTypeId: kg?.id, quantity: 1, stock: 80 },
      { name: 'Kodo Millet', price: 130, categoryId: categories[4].id, unitTypeId: kg?.id, quantity: 1, stock: 70 },
      { name: 'Barnyard Millet', price: 140, categoryId: categories[4].id, unitTypeId: kg?.id, quantity: 1, stock: 70 },
      { name: 'Bajra', price: 80, categoryId: categories[4].id, unitTypeId: kg?.id, quantity: 1, stock: 100 },

      // Raw Powder (Category index 5)
      { name: 'Turmeric Powder', price: 250, categoryId: categories[5].id, unitTypeId: g500?.id, quantity: 0.5, stock: 100 },
      { name: 'Red Chili Powder', price: 220, categoryId: categories[5].id, unitTypeId: g500?.id, quantity: 0.5, stock: 100 },
      { name: 'Coriander Powder', price: 180, categoryId: categories[5].id, unitTypeId: g500?.id, quantity: 0.5, stock: 80 },
      { name: 'Cumin Powder', price: 250, categoryId: categories[5].id, unitTypeId: g500?.id, quantity: 0.5, stock: 70 },
      { name: 'Black Pepper Powder', price: 250, categoryId: categories[5].id, unitTypeId: g500?.id, quantity: 0.25, stock: 70 },

      // Nutrition (Category index 6)
      { name: 'Almonds', price: 600, categoryId: categories[6].id, unitTypeId: g500?.id, quantity: 0.5, stock: 80 },
      { name: 'Cashews', price: 550, categoryId: categories[6].id, unitTypeId: g500?.id, quantity: 0.5, stock: 80 },
      { name: 'Walnuts', price: 400, categoryId: categories[6].id, unitTypeId: g500?.id, quantity: 0.5, stock: 60 },
      { name: 'Raisins', price: 150, categoryId: categories[6].id, unitTypeId: g500?.id, quantity: 0.5, stock: 80 },
      { name: 'Chia Seeds', price: 280, categoryId: categories[6].id, unitTypeId: g500?.id, quantity: 0.5, stock: 60 },

      // Dry Fruits (Category index 7)
      { name: 'Almonds', price: 600, categoryId: categories[7].id, unitTypeId: g500?.id, quantity: 0.5, stock: 100 },
      { name: 'Cashews', price: 550, categoryId: categories[7].id, unitTypeId: g500?.id, quantity: 0.5, stock: 100 },
      { name: 'Raisins', price: 200, categoryId: categories[7].id, unitTypeId: g500?.id, quantity: 0.5, stock: 80 },
      { name: 'Walnuts', price: 400, categoryId: categories[7].id, unitTypeId: g500?.id, quantity: 0.5, stock: 70 },
      { name: 'Pistachios', price: 450, categoryId: categories[7].id, unitTypeId: g500?.id, quantity: 0.5, stock: 60 },
      { name: 'Dates', price: 250, categoryId: categories[7].id, unitTypeId: kg?.id, quantity: 1, stock: 80 },

      // Festival (Category index 8)
      { name: 'Festival Dry Fruit Box', price: 1500, categoryId: categories[8].id, unitTypeId: pkt?.id, quantity: 1, stock: 50 },
      { name: 'Festival Sweets', price: 800, categoryId: categories[8].id, unitTypeId: kg?.id, quantity: 1, stock: 80 },
      { name: 'Dates Gift Box', price: 1000, categoryId: categories[8].id, unitTypeId: pkt?.id, quantity: 1, stock: 50 },
      { name: 'Chocolate Box', price: 600, categoryId: categories[8].id, unitTypeId: pkt?.id, quantity: 1, stock: 60 },

      // Flowers (Category index 9)
      { name: 'Rose Bouquet', price: 350, categoryId: categories[9].id, unitTypeId: pc?.id, quantity: 1, stock: 50 },
      { name: 'Marigold Flowers', price: 80, categoryId: categories[9].id, unitTypeId: kg?.id, quantity: 0.1, stock: 80 },
      { name: 'Jasmine Flowers', price: 150, categoryId: categories[9].id, unitTypeId: kg?.id, quantity: 0.05, stock: 50 },
      { name: 'Garland', price: 250, categoryId: categories[9].id, unitTypeId: pc?.id, quantity: 1, stock: 40 },

      // Sprouts (Category index 10)
      { name: 'Moong Sprouts', price: 60, categoryId: categories[10].id, unitTypeId: g500?.id, quantity: 0.5, stock: 80 },
      { name: 'Chana Sprouts', price: 50, categoryId: categories[10].id, unitTypeId: g500?.id, quantity: 0.5, stock: 70 },
      { name: 'Horse Gram Sprouts', price: 50, categoryId: categories[10].id, unitTypeId: g500?.id, quantity: 0.5, stock: 60 },
      { name: 'Masoor Sprouts', price: 55, categoryId: categories[10].id, unitTypeId: g500?.id, quantity: 0.5, stock: 60 },
      { name: 'Alfalfa Sprouts', price: 80, categoryId: categories[10].id, unitTypeId: g500?.id, quantity: 0.25, stock: 40 }
    ];

    await db.Product.bulkCreate(products);
    console.log('Created ' + products.length + ' products');

    // Create PackTypes
    const packTypes = [
      // Fruits - Small Fruit Pack at ₹599
      { name: 'Small Fruit Pack', categoryId: categories[0].id, duration: 'small', basePrice: 599, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Seasonal Fruits', weight: 'Approx 3-4 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Fruit Pack', categoryId: categories[0].id, duration: 'medium', basePrice: 999, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Fruit Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Fruit Pack', categoryId: categories[0].id, duration: 'large', basePrice: 1799, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '8-12 Premium + Seasonal Fruits', weight: 'Approx 10-15 Kg', targetAudience: 'Health Enthusiasts', includesExotic: true },
      
      // Vegetables
      { name: 'Small Vegetable Pack', categoryId: categories[1].id, duration: 'small', basePrice: 399, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '6-8 Basic Vegetables', weight: 'Approx 3-4 Kg', targetAudience: 'Daily Cooking Essentials' },
      { name: 'Medium Vegetable Pack', categoryId: categories[1].id, duration: 'medium', basePrice: 699, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '10-12 Vegetable Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'Includes Leafy Vegetables' },
      { name: 'Large Vegetable Pack', categoryId: categories[1].id, duration: 'large', basePrice: 1299, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '15+ Vegetable Varieties', weight: 'Approx 10-12 Kg', targetAudience: 'Includes Leafy + Seasonal Specials' },

      // Grocery
      { name: 'Small Grocery Pack', categoryId: categories[2].id, duration: 'small', basePrice: 499, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: 'Rice, Dal, Oil, Salt, Spices', weight: 'Approx 4-5 Kg', targetAudience: 'Ideal for Small Families' },
      { name: 'Medium Grocery Pack', categoryId: categories[2].id, duration: 'medium', basePrice: 899, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: 'Rice, Pulses, Oil, Atta', weight: 'Approx 8-10 Kg', targetAudience: 'Complete Kitchen Essentials' },
      { name: 'Large Grocery Pack', categoryId: categories[2].id, duration: 'large', basePrice: 1699, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Month', itemCount: 'Rice, Atta, Pulses, Oil, Spices, Sugar', weight: 'Approx 15-20 Kg', targetAudience: 'Full Kitchen Setup' },

      // Juices
      { name: 'Small Juice Pack', categoryId: categories[3].id, duration: 'small', basePrice: 399, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '3-4 Juice Varieties', weight: 'Approx 3-4 Bottles', targetAudience: 'Healthy Daily Drink' },
      { name: 'Medium Juice Pack', categoryId: categories[3].id, duration: 'medium', basePrice: 699, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Juice Varieties', weight: 'Approx 6-8 Bottles', targetAudience: 'Kids + Adults' },
      { name: 'Large Juice Pack', categoryId: categories[3].id, duration: 'large', basePrice: 1199, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '8-10 Juice Varieties', weight: 'Approx 10-12 Bottles', targetAudience: 'Includes Detox Juices' },

      // Millets
      { name: 'Small Millets Pack', categoryId: categories[4].id, duration: 'small', basePrice: 349, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '2-3 Millets Types', weight: 'Approx 1.5-2 Kg', targetAudience: 'Beginner Friendly' },
      { name: 'Medium Millets Pack', categoryId: categories[4].id, duration: 'medium', basePrice: 599, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '4-5 Millets Types', weight: 'Approx 3-4 Kg', targetAudience: 'Weekly Healthy Meals' },
      { name: 'Large Millets Pack', categoryId: categories[4].id, duration: 'large', basePrice: 999, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '6-8 Millet Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'For Regular Millet Consumers' },

      // Raw Powder
      { name: 'Small Raw Powder Pack', categoryId: categories[5].id, duration: 'small', basePrice: 399, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '3-4 Raw Powders', weight: 'Approx 500g – 1 Kg', targetAudience: 'Daily Health Mix' },
      { name: 'Medium Raw Powder Pack', categoryId: categories[5].id, duration: 'medium', basePrice: 699, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Raw Powders', weight: 'Approx 1.5-2 Kg', targetAudience: 'Family Nutrition' },
      { name: 'Large Raw Powder Pack', categoryId: categories[5].id, duration: 'large', basePrice: 1199, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '8+ Raw Powders', weight: 'Approx 3-4 Kg', targetAudience: 'For Regular Wellness Use' },

      // Nutrition
      { name: 'Small Nutrition Pack', categoryId: categories[6].id, duration: 'small', basePrice: 499, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: 'Sprouts + Fruits + Nuts Mix', weight: 'Approx 2-3 Kg', targetAudience: 'Balanced Nutrition' },
      { name: 'Medium Nutrition Pack', categoryId: categories[6].id, duration: 'medium', basePrice: 899, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: 'Fruits + Sprouts + Millets + Nuts', weight: 'Approx 5-6 Kg', targetAudience: 'Weekly Nutrition' },
      { name: 'Large Nutrition Pack', categoryId: categories[6].id, duration: 'large', basePrice: 1599, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: 'Fruits + Juices + Millets + Nuts + Powders', weight: 'Approx 8-10 Kg', targetAudience: 'Full Health Diet Pack' },

      // Dry Fruits
      { name: 'Small Dry Fruit Pack', categoryId: categories[7].id, duration: 'small', basePrice: 499, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: 'Almonds, Cashews, Raisins', weight: 'Approx 500g – 1 Kg', targetAudience: 'Daily Energy' },
      { name: 'Medium Dry Fruit Pack', categoryId: categories[7].id, duration: 'medium', basePrice: 899, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Dry Fruit Varieties', weight: 'Approx 1.5-2 Kg', targetAudience: 'Family Health Pack' },
      { name: 'Large Dry Fruit Pack', categoryId: categories[7].id, duration: 'large', basePrice: 1699, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '8+ Premium Dry Fruits', weight: 'Approx 3-4 Kg', targetAudience: 'Premium Box' },

      // Festival
      { name: 'Small Festival Pack', categoryId: categories[8].id, duration: 'small', basePrice: 799, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: 'Festival Special', itemCount: 'Dry Fruits + Sweets + Fruits', weight: 'Approx 2-3 Kg', targetAudience: 'Ideal for Small Gifting' },
      { name: 'Medium Festival Pack', categoryId: categories[8].id, duration: 'medium', basePrice: 1499, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: 'Festival Special', itemCount: 'Dry Fruits + Fruits + Juices + Flowers', weight: 'Approx 4-5 Kg', targetAudience: 'Family Celebration' },
      { name: 'Large Festival Pack', categoryId: categories[8].id, duration: 'large', basePrice: 2499, sizeLabel: '🔴 Large', persons: 'Joint Family', days: 'Festival Special', itemCount: 'Premium Dry Fruits + Fruits + Sweets + Flower Basket', weight: 'Approx 8-10 Kg', targetAudience: 'Premium Gift Box' },

      // Flowers
      { name: 'Small Flower Pack', categoryId: categories[9].id, duration: 'small', basePrice: 249, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: 'Daily', itemCount: 'Loose Flowers / Small Garland', weight: 'Approx 250–500g', targetAudience: 'Daily Pooja' },
      { name: 'Medium Flower Pack', categoryId: categories[9].id, duration: 'medium', basePrice: 449, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: 'Weekly', itemCount: 'Mixed Flowers + Garlands', weight: 'Approx 1 Kg', targetAudience: 'Temple / Home Use' },
      { name: 'Large Flower Pack', categoryId: categories[9].id, duration: 'large', basePrice: 799, sizeLabel: '🔴 Large', persons: 'Joint Family', days: 'Weekly', itemCount: 'Bulk Flowers + Garlands', weight: 'Approx 2-3 Kg', targetAudience: 'Event / Decoration' },

      // Sprouts
      { name: 'Small Sprouts Pack', categoryId: categories[10].id, duration: 'small', basePrice: 199, sizeLabel: '🟢 Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '2-3 Sprout Varieties', weight: 'Approx 500g – 1 Kg', targetAudience: 'Health Starter' },
      { name: 'Medium Sprouts Pack', categoryId: categories[10].id, duration: 'medium', basePrice: 349, sizeLabel: '🟡 Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '4-5 Sprout Varieties', weight: 'Approx 1.5-2 Kg', targetAudience: 'Weekly Health' },
      { name: 'Large Sprouts Pack', categoryId: categories[10].id, duration: 'large', basePrice: 599, sizeLabel: '🔴 Large', persons: 'Joint Family', days: '1 Week+', itemCount: '6+ Sprout Varieties', weight: 'Approx 3-4 Kg', targetAudience: 'Protein Pack' }
    ];

    await db.PackType.bulkCreate(packTypes);
    console.log('Created ' + packTypes.length + ' pack types');

    // Create Packs
    const dbPackTypes = await db.PackType.findAll();
    const packs = [];
    for (const pt of dbPackTypes) {
      if (pt.categoryId) {
        packs.push({
          name: pt.name,
          description: pt.itemCount + ' - ' + pt.weight,
          categoryId: pt.categoryId,
          packTypeId: pt.id,
          basePrice: pt.basePrice,
          finalPrice: pt.basePrice,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: true
        });
      }
    }
    await db.Pack.bulkCreate(packs);
    console.log('Created ' + packs.length + ' packs');

    // Create Pack-Product associations
    const dbPacks = await db.Pack.findAll();
    const dbProducts = await db.Product.findAll();
    const productsByCat = {};
    for (const p of dbProducts) {
      if (!productsByCat[p.categoryId]) productsByCat[p.categoryId] = [];
      productsByCat[p.categoryId].push(p);
    }

    const packProducts = [];
    for (const pack of dbPacks) {
      const prods = productsByCat[pack.categoryId] || [];
      for (const p of prods) {
        packProducts.push({
          packId: pack.id,
          productId: p.id,
          quantity: 1,
          unitPrice: p.price
        });
      }
    }
    await db.PackProduct.bulkCreate(packProducts);
    console.log('Created ' + packProducts.length + ' pack-product associations');

    console.log('\n=============================================');
    console.log('ALL DATA CREATED SUCCESSFULLY!');
    console.log('=============================================');

    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addData();
