const express = require('express');
const router = express.Router();
const { Payment, Order, User } = require('../models');

/**
 * GET /api/payments
 * Fetch all payments for admin dashboard
 */
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'phone'],
              required: false
            }
          ]
        }
      ]
    });

    const formattedPayments = payments.map(payment => {
      const p = payment.toJSON();
      const user = p.order && p.order.User ? p.order.User : null;
      return {
        id: p.id,
        orderId: p.orderId,
        customerName: user ? user.name : 'N/A',
        amount: p.amount,
        method: p.paymentMethod || 'Online',
        status: p.status,
        currency: p.currency,
        razorpayPaymentId: p.razorpayPaymentId,
        razorpayOrderId: p.razorpayOrderId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      };
    });

    res.json(formattedPayments);
  } catch (e) {
    console.error('Error fetching payments:', e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/payments/:id
 * Fetch a single payment by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'phone'],
              required: false
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const p = payment.toJSON();
    res.json({
      id: p.id,
      orderId: p.orderId,
      customerName: p.order && p.order.User ? p.order.User.name : 'N/A',
      amount: p.amount,
      method: p.paymentMethod || 'Online',
      status: p.status,
      currency: p.currency,
      razorpayPaymentId: p.razorpayPaymentId,
      razorpayOrderId: p.razorpayOrderId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      order: p.order
    });
  } catch (e) {
    console.error('Error fetching payment:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
