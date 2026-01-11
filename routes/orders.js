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
