require('dotenv').config();
const { Order, Address, User } = require('./models');

async function importAddresses() {
  try {
    console.log('Starting address import from orders...');

    // Get all orders with deliveryAddress
    const orders = await Order.findAll({
      attributes: ['userId', 'deliveryAddress'],
      where: {
        deliveryAddress: {
          [require('sequelize').Op.ne]: null,
          [require('sequelize').Op.ne]: ''
        }
      },
      include: [{
        model: User,
        attributes: ['id']
      }]
    });

    console.log(`Found ${orders.length} orders with delivery addresses`);

    // Group by userId and unique deliveryAddress
    const addressMap = new Map();

    orders.forEach(order => {
      if (!order.userId || !order.deliveryAddress) return;

      if (!addressMap.has(order.userId)) {
        addressMap.set(order.userId, new Set());
      }
      addressMap.get(order.userId).add(order.deliveryAddress.trim());
    });

    let importedCount = 0;

    for (const [userId, addresses] of addressMap) {
      for (const deliveryAddress of addresses) {
        // Check if this address already exists for the user
        const existingAddress = await Address.findOne({
          where: {
            userId,
            address: deliveryAddress
          }
        });

        if (!existingAddress) {
          // Create new address
          await Address.create({
            userId,
            type: 'home',
            name: 'Imported from Order',
            address: deliveryAddress,
            isDefault: false
          });
          importedCount++;
        }
      }
    }

    console.log(`Successfully imported ${importedCount} addresses`);
  } catch (error) {
    console.error('Error importing addresses:', error);
  } finally {
    process.exit(0);
  }
}

importAddresses();