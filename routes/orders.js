const express = require('express');
const router = express.Router();
const { Order, Payment, sequelize } = require('../models');

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
    const orderData = req.body;

    // Create Order
    const newOrder = await Order.create(
      {
        userId: orderData.userId,
        quantity: orderData.quantity,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        totalAmount: orderData.totalAmount,
        isCustom: orderData.isCustom || false,
        customPackName: orderData.customPackName || null,
        customPackItems: orderData.customPackItems || null,
        unitPrice: orderData.unitPrice || null,
        packId: orderData.packId || null,
        status: 'Processing'
      },
      { transaction }
    );

    // Create Payment
    await Payment.create(
      {
        orderId: newOrder.id,
        userId: orderData.userId,
        amount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
        status:
          orderData.paymentMethod === 'cod'
            ? 'completed'
            : 'pending'
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(newOrder);

  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
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

module.exports = router;
