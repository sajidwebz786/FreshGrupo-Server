const express = require('express');
const router = express.Router();
const { Cart, Pack } = require('../models');

/**
 * GET /api/cart/:userId
 * Fetch user's active cart items
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const cartItems = await Cart.findAll({
      where: { userId, isActive: true },
      include: [
        {
          model: Pack,
          as: 'pack',
          required: false
        }
      ]
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', async (req, res) => {
  try {
    const { userId, packId, quantity, isCustom, customPackName, customPackItems, unitPrice } = req.body;

    let unitPriceValue = unitPrice;
    let totalPriceValue;

    if (packId && !isCustom) {
      const pack = await Pack.findByPk(packId);
      if (!pack) {
        return res.status(404).json({ error: 'Pack not found' });
      }
      unitPriceValue = pack.finalPrice;
    }

    totalPriceValue = unitPriceValue * quantity;

    const newCartItem = await Cart.create({
      userId,
      packId: packId || null,
      quantity,
      unitPrice: unitPriceValue,
      totalPrice: totalPriceValue,
      isActive: true,
      isCustom: isCustom || false,
      customPackName: customPackName || null,
      customPackItems: customPackItems || null
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

/**
 * PUT /api/cart/:id
 * Update quantity of cart item
 */
router.put('/:id', async (req, res) => {
  try {
    const cartId = parseInt(req.params.id);
    const { quantity, userId } = req.body;

    if (isNaN(cartId)) {
      return res.status(400).json({ error: 'Invalid cart item id' });
    }

    const cartItem = await Cart.findOne({
      where: { id: cartId, userId, isActive: true }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const totalPriceValue = cartItem.unitPrice * quantity;

    await cartItem.update({
      quantity,
      totalPrice: totalPriceValue
    });

    res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

/**
 * DELETE /api/cart/:id
 * Remove item from cart
 */
router.delete('/:id', async (req, res) => {
  try {
    const cartId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(cartId)) {
      return res.status(400).json({ error: 'Invalid cart item id' });
    }

    const cartItem = await Cart.findOne({
      where: { id: cartId, userId, isActive: true }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await cartItem.destroy();

    res.status(200).json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

module.exports = router;