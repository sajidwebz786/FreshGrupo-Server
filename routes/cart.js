const express = require('express');
const router = express.Router();
const { Cart, Pack, User, PackType } = require('../models');
const verifyToken = require('../middleware/auth');

/**
 * GET /api/cart/:userId
 * Fetch user's active cart items
 */
router.get('/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Validate userId - but don't return error, just return empty array
    if (isNaN(userId) || userId <= 0) {
      console.log('Invalid userId received:', req.params.userId);
      return res.status(200).json([]);
    }

   const cartItems = await Cart.findAll({
  where: { userId, isActive: true },
  include: [
    {
      model: Pack,
      required: false,
      include: [
        {
          model: PackType
        }
      ]
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

    // Validate userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let unitPriceValue = unitPrice;
    let totalPriceValue;

    if (packId && !isCustom) {
  const pack = await Pack.findByPk(packId);
  if (!pack) {
    return res.status(404).json({ error: 'Pack not found' });
  }

  // ✅ Use frontend price if provided
  if (unitPrice) {
    unitPriceValue = unitPrice;
  } else {
    unitPriceValue = pack.sellingPrice || pack.finalPrice;
  }
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
    const { quantity } = req.body;
    const cartItem = await Cart.findByPk(req.params.id);

    if (cartItem) {
      await cartItem.update({
        quantity,
        totalPrice: quantity * cartItem.unitPrice,
      });
      res.json(cartItem);
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/cart/:id
 * Remove item from cart
 */
router.delete('/:id', async (req, res) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (cartItem) {
      await cartItem.update({ isActive: false });
      res.json({ message: "Cart item removed successfully" });
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/cart/clear/:userId
 * Clear all cart items for a user
 */
router.delete('/clear/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    console.log('Clearing cart for userId:', userId);
    
    if (isNaN(userId)) {
      console.log('Invalid userId:', req.params.userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // First check what carts exist for this user
    const beforeCarts = await Cart.findAll({ where: { userId } });
    console.log('Carts before clear:', beforeCarts.map(c => c.toJSON()));
    
    const result = await Cart.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );
    
    console.log('Cart clear result:', result);
    
    // Check after
    const afterCarts = await Cart.findAll({ where: { userId } });
    console.log('Carts after clear:', afterCarts.map(c => c.toJSON()));
    
    res.json({ message: `Cleared ${result[0]} cart items` });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
