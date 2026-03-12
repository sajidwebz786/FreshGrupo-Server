require('dotenv').config();
const db = require('./models');

async function addPackTypes() {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models to add new columns
    console.log('📦 Syncing database...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced.');

    // Check existing pack types
    const existingPackTypes = await db.PackType.findAll();
    console.log('📋 Existing pack types:', existingPackTypes.length);

    // Define all pack types to add
    const packTypesToAdd = [
      // Fruits Pack (Category ID: 1)
      { name: 'Small Fruit Pack', categoryId: 1, duration: 'small', basePrice: 350.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Seasonal Fruits', weight: 'Approx 3-4 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Fruit Pack', categoryId: 1, duration: 'medium', basePrice: 650.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Fruit Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Fruit Pack', categoryId: 1, duration: 'large', basePrice: 1200.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8-12 Premium + Seasonal Fruits', weight: '10-15 Kg', targetAudience: 'Health Enthusiasts', includesExotic: true },
      
      // Vegetables Pack (Category ID: 2)
      { name: 'Small Vegetable Pack', categoryId: 2, duration: 'small', basePrice: 300.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Seasonal Vegetables', weight: 'Approx 3-4 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Vegetable Pack', categoryId: 2, duration: 'medium', basePrice: 550.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Vegetable Varieties', weight: 'Approx 6-8 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Vegetable Pack', categoryId: 2, duration: 'large', basePrice: 1000.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8-12 Premium + Seasonal Vegetables', weight: '10-15 Kg', targetAudience: 'Health Enthusiasts', includesExotic: true },

      // Grocery Pack (Category ID: 3)
      { name: 'Small Grocery Pack', categoryId: 3, duration: 'small', basePrice: 400.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '8-10 Essential Items', weight: 'Approx 3-4 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Grocery Pack', categoryId: 3, duration: 'medium', basePrice: 750.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '15-20 Essential Items', weight: 'Approx 6-8 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Grocery Pack', categoryId: 3, duration: 'large', basePrice: 1400.00, sizeLabel: 'Large', persons: 'Joint Family', days: '1 Week+', itemCount: '25-30 Premium Items', weight: '10-15 Kg', targetAudience: 'Large Families' },

      // Dry Fruit Pack (Category ID: 8)
      { name: 'Small Dry Fruit Pack', categoryId: 8, duration: 'small', basePrice: 500.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Premium Dry Fruits', weight: 'Approx 0.5-1 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Dry Fruit Pack', categoryId: 8, duration: 'medium', basePrice: 900.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Premium Dry Fruits', weight: 'Approx 1-2 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Dry Fruit Pack', categoryId: 8, duration: 'large', basePrice: 1800.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '10-15 Premium Dry Fruits', weight: 'Approx 2-3 Kg', targetAudience: 'Health Enthusiasts', includesExotic: true },

      // Millets Pack (Category ID: 5)
      { name: 'Small Millets Pack', categoryId: 5, duration: 'small', basePrice: 350.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '3-4 Millet Varieties', weight: 'Approx 2-3 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Millets Pack', categoryId: 5, duration: 'medium', basePrice: 650.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Millet Varieties', weight: 'Approx 4-5 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Millets Pack', categoryId: 5, duration: 'large', basePrice: 1100.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8-10 Premium Millets', weight: 'Approx 8-10 Kg', targetAudience: 'Health Enthusiasts' },

      // Juices Pack (Category ID: 4)
      { name: 'Small Juices Pack', categoryId: 4, duration: 'small', basePrice: 300.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Juice Varieties', weight: 'Approx 2-3 Liters', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Juices Pack', categoryId: 4, duration: 'medium', basePrice: 550.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Juice Varieties', weight: 'Approx 4-5 Liters', targetAudience: 'Kids + Working Family' },
      { name: 'Large Juices Pack', categoryId: 4, duration: 'large', basePrice: 1000.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '10-12 Premium Juices', weight: 'Approx 8-10 Liters', targetAudience: 'Health Enthusiasts' },

      // Raw Powder Pack (Category ID: 6)
      { name: 'Small Raw Powder Pack', categoryId: 6, duration: 'small', basePrice: 400.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Powder Varieties', weight: 'Approx 0.5-1 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Raw Powder Pack', categoryId: 6, duration: 'medium', basePrice: 750.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Powder Varieties', weight: 'Approx 1-2 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Raw Powder Pack', categoryId: 6, duration: 'large', basePrice: 1400.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '10-15 Premium Powders', weight: 'Approx 2-3 Kg', targetAudience: 'Health Enthusiasts' },

      // Nutrition Pack (Category ID: 7)
      { name: 'Small Nutrition Pack', categoryId: 7, duration: 'small', basePrice: 500.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '4-5 Nutrition Items', weight: 'Approx 0.5-1 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Nutrition Pack', categoryId: 7, duration: 'medium', basePrice: 900.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '6-8 Nutrition Items', weight: 'Approx 1-2 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Nutrition Pack', categoryId: 7, duration: 'large', basePrice: 1600.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '10-15 Premium Items', weight: 'Approx 2-3 Kg', targetAudience: 'Health Enthusiasts' },

      // Festival Pack (Category ID: 9)
      { name: 'Small Festival Pack', categoryId: 9, duration: 'small', basePrice: 800.00, sizeLabel: 'Small', persons: '1-2 Persons', days: 'Festival Special', itemCount: '8-10 Festival Items', weight: 'Approx 2-3 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Festival Pack', categoryId: 9, duration: 'medium', basePrice: 1500.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: 'Festival Special', itemCount: '15-20 Festival Items', weight: 'Approx 4-5 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Festival Pack', categoryId: 9, duration: 'large', basePrice: 2500.00, sizeLabel: 'Large', persons: 'Joint Family', days: 'Festival Special', itemCount: '25-30 Premium Items', weight: 'Approx 8-10 Kg', targetAudience: 'Large Families' },

      // Flower Pack (Category ID: 10)
      { name: 'Small Flower Pack', categoryId: 10, duration: 'small', basePrice: 250.00, sizeLabel: 'Small', persons: '1-2 Persons', days: 'Weekly', itemCount: '2-3 Bouquets', weight: 'Approx 1-2 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Flower Pack', categoryId: 10, duration: 'medium', basePrice: 450.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: 'Weekly', itemCount: '4-5 Bouquets', weight: 'Approx 2-3 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Flower Pack', categoryId: 10, duration: 'large', basePrice: 800.00, sizeLabel: 'Large', persons: 'Joint Family / Florists', days: 'Weekly', itemCount: '6-8 Premium Bouquets', weight: 'Approx 4-5 Kg', targetAudience: 'Health Enthusiasts' },

      // Sprouts Pack (Category ID: 11)
      { name: 'Small Sprouts Pack', categoryId: 11, duration: 'small', basePrice: 200.00, sizeLabel: 'Small', persons: '1-2 Persons', days: '3-4 Days', itemCount: '3-4 Sprout Varieties', weight: 'Approx 0.5-1 Kg', targetAudience: 'Basic Family Consumption' },
      { name: 'Medium Sprouts Pack', categoryId: 11, duration: 'medium', basePrice: 350.00, sizeLabel: 'Medium', persons: '3-4 Persons', days: '1 Week', itemCount: '5-6 Sprout Varieties', weight: 'Approx 1-2 Kg', targetAudience: 'Kids + Working Family' },
      { name: 'Large Sprouts Pack', categoryId: 11, duration: 'large', basePrice: 600.00, sizeLabel: 'Large', persons: 'Joint Family / Health Lovers', days: '1 Week+', itemCount: '8-10 Premium Sprouts', weight: 'Approx 2-3 Kg', targetAudience: 'Health Enthusiasts' },

      // Custom Pack (for any category)
      { name: 'Custom Pack', categoryId: null, duration: 'custom', basePrice: 0, sizeLabel: 'Custom', persons: 'Any', days: 'Custom', itemCount: 'Your Choice', weight: 'Custom', targetAudience: 'Personalized' }
    ];

    // Add pack types that don't exist
    let addedCount = 0;
    for (const pt of packTypesToAdd) {
      const exists = existingPackTypes.find(ept => 
        ept.name === pt.name && ept.categoryId === pt.categoryId
      );
      if (!exists) {
        await db.PackType.create(pt);
        console.log(`✅ Added: ${pt.name} (Category: ${pt.categoryId})`);
        addedCount++;
      }
    }
    console.log(`✅ Added ${addedCount} new pack types.`);

    // Now get all pack types and update packs
    const allPackTypes = await db.PackType.findAll();
    console.log('📋 Total pack types:', allPackTypes.length);

    // Get all packs
    const packs = await db.Pack.findAll({ include: [db.Category] });
    console.log('📋 Found packs:', packs.length);

    // Map categories to their pack types
    const categoryPackTypeMap = {};
    allPackTypes.forEach(pt => {
      if (pt.categoryId) {
        if (!categoryPackTypeMap[pt.categoryId]) {
          categoryPackTypeMap[pt.categoryId] = {};
        }
        categoryPackTypeMap[pt.categoryId][pt.duration] = pt.id;
      }
    });

    console.log('📋 Category mapping:', JSON.stringify(categoryPackTypeMap, null, 2));

    // Update each pack
    let updatedCount = 0;
    for (const pack of packs) {
      const categoryId = pack.categoryId;
      const currentPackTypeId = pack.packTypeId;
      
      let newPackTypeId = null;
      
      if (categoryPackTypeMap[categoryId]) {
        const packName = pack.name.toLowerCase();
        let duration = 'small';
        
        if (packName.includes('medium') || packName.includes('bi-week')) {
          duration = 'medium';
        } else if (packName.includes('large') || packName.includes('monthly')) {
          duration = 'large';
        } else if (packName.includes('custom')) {
          duration = 'custom';
        }
        
        newPackTypeId = categoryPackTypeMap[categoryId][duration];
      }

      if (newPackTypeId && newPackTypeId !== currentPackTypeId) {
        console.log(`📝 Updating pack "${pack.name}" (ID: ${pack.id}): ${currentPackTypeId} -> ${newPackTypeId}`);
        await db.Pack.update({ packTypeId: newPackTypeId }, { where: { id: pack.id } });
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} packs with correct pack types.`);

    // Show results
    const updatedPacks = await db.Pack.findAll({ 
      include: [
        { model: db.Category, as: 'Category', attributes: ['id', 'name'] },
        { model: db.PackType, as: 'PackType', attributes: ['id', 'name'] }
      ]
    });

    console.log('\n📋 All Packs:');
    updatedPacks.forEach(pack => {
      console.log(`  - ${pack.name} | Category: ${pack.Category?.name} | Pack Type: ${pack.PackType?.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addPackTypes();
