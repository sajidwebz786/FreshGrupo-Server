const express = require('express');
const router = express.Router();
const { Order, Payment, OrderPackContent, Pack, PackProduct, Product, PackType, Category, sequelize, User } = require('../models');

/**
 * GET /api/orders
 * Fetch all orders for admin dashboard
 */
router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'phone'],
          required: false
        },
        {
          model: Payment,
          as: 'payment',
          required: false
        },
        {
          model: Pack,
          include: [
            { model: PackType },
            { model: Category }
          ],
          required: false
        }
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:userId
 * Fetch order history for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Payment,
          as: 'payment',
          required: false
        },
        {
          model: OrderPackContent,
          as: 'packContents',
          required: false
        }
      ]
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * POST /api/orders
 * Create new order + payment (transaction safe)
 */
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      userId,
      quantity,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      isCustom,
      customPackName,
      customPackItems,
      unitPrice,
      packId,
      timeSlot,
      deliveryDate
    } = req.body;

    const newOrder = await Order.create(
      {
        userId,
        quantity,
        deliveryAddress,
        paymentMethod,
        totalAmount,
        isCustom: isCustom || false,
        customPackName: customPackName || null,
        customPackItems: customPackItems || null,
        unitPrice: unitPrice || null,
        packId: packId || null,
        timeSlot: timeSlot || null,
        deliveryDate: deliveryDate || null,
        status: 'processing'
      },
      { transaction }
    );

    let razorpayOrderId = null;

    if (paymentMethod === 'razorpay') {
      const razorpayOrder = await global.razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: `order_${newOrder.id}`,
      });
      razorpayOrderId = razorpayOrder.id;
    }

    await Payment.create(
      {
        orderId: newOrder.id,
        userId,
        amount: totalAmount,
        paymentMethod,
        status: 'pending'
      },
      { transaction }
    );

    // Create OrderPackContent for standard packs
    if (packId && !isCustom) {
      const packProducts = await PackProduct.findAll({
        where: { packId },
        include: [{ model: Product }],
        transaction
      });

      for (const packProduct of packProducts) {
        await OrderPackContent.create({
          orderId: newOrder.id,
          productId: packProduct.productId,
          productName: packProduct.Product.name,
          quantity: packProduct.quantity,
          unitPrice: packProduct.unitPrice
        }, { transaction });
      }
    }

    await transaction.commit();

    res.status(201).json({
      ...newOrder.toJSON(),
      razorpayOrderId
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});


/**
 * PUT /api/orders/:orderId/payment
 * Update Razorpay payment status
 */
router.put('/:orderId/payment', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { razorpayPaymentId, razorpayOrderId, status } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }

    const updated = await Payment.update(
      {
        razorpayPaymentId,
        razorpayOrderId,
        status
      },
      {
        where: { orderId }
      }
    );

    if (updated[0] === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

/**
 * GET /api/orders/details/:orderId
 * Fetch single order details
 */
router.get('/details/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Payment,
          as: 'payment',
          required: false
        },
        {
          model: OrderPackContent,
          as: 'packContents',
          required: false
        },
        {
          model: Pack,
          include: [
            { model: PackType },
            { model: Category }
          ],
          required: false
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
