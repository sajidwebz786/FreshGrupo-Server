const express = require('express');
const router = express.Router();
const { Order, Payment } = require('../models');

// GET /api/orders/:userId - Fetch order history for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.findAll({
      where: { userId: parseInt(userId) },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Payment,
          as: 'payment',
          required: false
        }
      ]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    const orderData = req.body;

    // Create the order
    const newOrder = await Order.create(orderData);

    // Create payment record
    await Payment.create({
      orderId: newOrder.id,
      amount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      status: orderData.paymentMethod === 'cod' ? 'completed' : 'pending'
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:orderId/payment - Update payment status
router.put('/:orderId/payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { razorpayPaymentId, razorpayOrderId, status } = req.body;

    await Payment.update(
      {
        razorpayPaymentId,
        razorpayOrderId,
        status
      },
      { where: { orderId } }
    );

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

module.exports = router;
