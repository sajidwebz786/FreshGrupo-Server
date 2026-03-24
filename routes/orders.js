const express = require('express');
const router = express.Router();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const { Order, Payment, OrderPackContent, Pack, PackProduct, Product, PackType, Category, sequelize, User, Cart, Notification, Wallet, WalletTransaction } = require('../models');

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
        { model: Payment, as: 'payment', required: false },
        { model: OrderPackContent, as: 'packContents', required: false },
        {
          model: Pack,
          include: [{ model: PackType }, { model: Category }],
          required: false
        }
      ]
    });

    // 🔥 FIXED PART
    for (let order of orders) {
      if (order.packId && !order.isCustom) {
        const packProducts = await PackProduct.findAll({
          where: { packId: order.packId },
          include: [
            { model: Product, as: 'Product' },
            {
              model: UnitType,
              as: 'UnitType', // ✅ MUST MATCH MODEL
              attributes: ['id', 'name', 'abbreviation']
            }
          ]
        });

        order.dataValues.packProducts = packProducts.map(pp => {
          let qty = pp.quantity;

          if (qty !== null && qty !== undefined) {
            qty = parseFloat(qty);
            qty = Number.isInteger(qty) ? parseInt(qty) : parseFloat(qty);
          }

          return {
            productId: pp.productId,
            name: pp.Product?.name || 'Unknown Product',
            quantity: qty,
            unitPrice: pp.unitPrice,

            // ✅ THIS IS THE KEY FIX
            unit: pp.UnitType?.abbreviation || ''
          };
        });
      }
    }

    res.status(200).json(orders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});


/**
 * POST /api/orders/razorpay/create-order
 * Create Razorpay order using pack finalPrice
 */
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { userId, useWallet } = req.body;

    const cartItems = await Cart.findAll({
      where: { userId, isActive: true }
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart empty' });
    }


    // ✅ TOTAL FROM CART (FIXES CUSTOM PACK ISSUE)
    let totalAmount = 0;
    cartItems.forEach(i => {
      totalAmount += parseFloat(i.totalPrice);
    });

    // Add GST (18%)
    const gstAmount = +(totalAmount * 0.18).toFixed(2);
    const totalWithGST = +(totalAmount + gstAmount).toFixed(2);

    let walletUsed = 0;
    let payableAmount = totalWithGST;

    const wallet = await Wallet.findOne({ where: { userId } });

    // ✅ HANDLE WALLET + RAZORPAY

    if (useWallet && wallet && wallet.balance > 0) {
      walletUsed = Math.min(wallet.balance, totalWithGST);
      payableAmount = totalWithGST - walletUsed;
    }

    // ✅ CREATE RAZORPAY ORDER ONLY FOR REMAINING

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(payableAmount * 100),
      currency: 'INR',
      receipt: `cart_${userId}_${Date.now()}`
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID,
      totalAmount: totalWithGST,
      gstAmount,
      walletUsed,
      payableAmount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/razorpay/verify', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      userId,
      razorpayPaymentId,
      razorpayOrderId,
      walletUsed,
      deliveryAddress,
      timeSlot,
      deliveryDate
    } = req.body;

    const cartItems = await Cart.findAll({
      where: { userId, isActive: true }
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart empty' });
    }

    let totalAmount = 0;
    cartItems.forEach(i => {
      totalAmount += parseFloat(i.totalPrice);
    });

    // ✅ CREATE ORDERS
    const createdOrders = [];

    for (const item of cartItems) {
      const order = await Order.create({
        userId,
        quantity: item.quantity,
        deliveryAddress,
        paymentMethod: walletUsed > 0 ? 'wallet+razorpay' : 'razorpay',
        totalAmount: item.totalPrice,
        isCustom: item.isCustom,
        packId: item.packId,
        customPackName: item.customPackName,
        customPackItems: item.customPackItems,
        timeSlot,
        deliveryDate,
        status: 'processing',
        paymentStatus: 'completed',
      }, { transaction });

      createdOrders.push(order);
    }

     // ✅ CREATE PAYMENT FOR EACH ORDER
    for (const order of createdOrders) {

      // 💰 WALLET PART (ONLY IF USED)
      if (walletUsed > 0) {
        await Payment.create({
          orderId: order.id,
          userId,
          amount: walletUsed / createdOrders.length, // split across orders
          paymentMethod: 'wallet',
          status: 'success'
        }, { transaction });
      }

      // 💳 RAZORPAY PART
      await Payment.create({
        orderId: order.id,
        userId,
        razorpayPaymentId,
        razorpayOrderId,
        amount: (totalAmount - walletUsed) / createdOrders.length,
        paymentMethod: 'razorpay',
        status: 'success'
      }, { transaction });
    }

    // ✅ WALLET DEDUCTION (ONLY HERE!)
    if (walletUsed > 0) {
      const wallet = await Wallet.findOne({ where: { userId } });

      const newBalance = wallet.balance - walletUsed;

      await wallet.update({ balance: newBalance }, { transaction });

      await WalletTransaction.create({
        walletId: wallet.id,
        userId,
        type: 'credit_spent',
        amount: -walletUsed,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        description: 'Wallet used with Razorpay',
        status: 'completed'
      }, { transaction });
    }

    // ✅ CLEAR CART
    await Cart.destroy({
  where: { userId },
  transaction
});

    await transaction.commit();

    res.json({
      success: true,
      orders: createdOrders
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
});

router.post('/wallet/checkout', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { userId, deliveryAddress, timeSlot, deliveryDate } = req.body;

    // ✅ 1. GET CART ITEMS FROM DB
    const cartItems = await Cart.findAll({
      where: { userId, isActive: true }
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // ✅ 2. CALCULATE TOTAL FROM DB (IMPORTANT)
    let totalAmount = 0;

    cartItems.forEach(item => {
      totalAmount += parseFloat(item.totalPrice);
    });

    // ✅ 3. CHECK WALLET
    const wallet = await Wallet.findOne({ where: { userId } });

    if (!wallet || wallet.balance < totalAmount) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
        balance: wallet?.balance || 0,
        required: totalAmount
      });
    }

    // ✅ 4. CREATE ORDERS (HANDLE MULTIPLE CART ITEMS)
    const createdOrders = [];

    for (const item of cartItems) {
      const order = await Order.create({
        userId,
        quantity: item.quantity,
        deliveryAddress,
        paymentMethod: 'wallet',
        totalAmount: item.totalPrice,
        isCustom: item.isCustom,
        packId: item.packId,
        customPackName: item.customPackName,
        customPackItems: item.customPackItems,
        timeSlot,
        deliveryDate,
        status: 'processing',
        paymentStatus: 'completed',
      }, { transaction });

      // ✅ HANDLE NORMAL PACK
      if (item.packId && !item.isCustom) {
        const packProducts = await PackProduct.findAll({
          where: { packId: item.packId },
          include: [
            { model: Product, include: [{ model: UnitType, as: 'UnitType' }] }
          ],
          transaction
        });

        for (const p of packProducts) {
          // Get unit from PackProduct first, then fallback to Product's UnitType
          const unit = p.UnitType?.abbreviation || p.Product?.UnitType?.abbreviation || '';
          await OrderPackContent.create({
            orderId: order.id,
            productId: p.productId,
            productName: p.Product.name,
            quantity: p.quantity,
            unit: unit,
            unitPrice: p.unitPrice
          }, { transaction });
        }
      }

      createdOrders.push(order);
    }

    // ✅ 5. DEDUCT WALLET ONCE (VERY IMPORTANT FIX)
    const newBalance = wallet.balance - totalAmount;

    await wallet.update({
      balance: newBalance
    }, { transaction });

    await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: 'credit_spent',
      amount: -totalAmount,
      balanceBefore: wallet.balance,
      balanceAfter: newBalance,
      description: `Order payment`,
      status: 'completed'
    }, { transaction });

    // ✅ 6. CLEAR CART
    await Cart.destroy({
  where: { userId },
  transaction
});

    await transaction.commit();

    res.json({
      success: true,
      orders: createdOrders,
      totalAmount,
      walletBalance: newBalance
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
  }
});




router.post('/cod/checkout', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      userId,
      deliveryAddress,
      timeSlot,
      deliveryDate,
      useWallet
    } = req.body;

    // ✅ 1. GET CART
    const cartItems = await Cart.findAll({
      where: { userId, isActive: true }
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart empty' });
    }

    // ✅ 2. TOTAL FROM DB
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += parseFloat(item.totalPrice);
    });

    // ✅ 3. WALLET CALCULATION
    let walletUsed = 0;
    let codAmount = totalAmount;

    const wallet = await Wallet.findOne({ where: { userId } });

    if (useWallet && wallet && wallet.balance > 0) {
      walletUsed = Math.min(wallet.balance, totalAmount);
      codAmount = totalAmount - walletUsed;
    }

    // ✅ 4. CREATE ORDERS
    const createdOrders = [];

    for (const item of cartItems) {
      const order = await Order.create({
        userId,
        quantity: item.quantity,
        deliveryAddress,
        paymentMethod:
          walletUsed > 0 ? 'wallet+cod' : 'cod',
        totalAmount: item.totalPrice,
        isCustom: item.isCustom,
        packId: item.packId,
        customPackName: item.customPackName,
        customPackItems: item.customPackItems,
        timeSlot,
        deliveryDate,
        status: 'processing',
        paymentStatus: 'pending',
        codAmount // optional field if you want
      }, { transaction });

      createdOrders.push(order);
    }

    // ✅ 5. DEDUCT WALLET (ONLY IF USED)
    if (walletUsed > 0) {
      const newBalance = wallet.balance - walletUsed;

      await wallet.update({
        balance: newBalance
      }, { transaction });

      await WalletTransaction.create({
        walletId: wallet.id,
        userId,
        type: 'credit_spent',
        amount: -walletUsed,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        description: 'Wallet used with COD',
        status: 'completed'
      }, { transaction });
    }

    // ✅ 6. CLEAR CART
   await Cart.destroy({
  where: { userId },
  transaction
});

    await transaction.commit();

    res.json({
      success: true,
      orders: createdOrders,
      totalAmount,
      walletUsed,
      codAmount
    });

  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: err.message });
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

    // Check wallet balance if payment method is wallet
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ where: { userId } });
      
      if (!wallet) {
        return res.status(400).json({ error: 'Wallet not found for this user' });
      }
      
      if (parseFloat(wallet.balance) < parseFloat(totalAmount)) {
        return res.status(400).json({ 
          error: 'Insufficient wallet balance', 
          currentBalance: wallet.balance,
          requiredAmount: totalAmount 
        });
      }
    }

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
        include: [
          { model: Product, include: [{ model: UnitType, as: 'UnitType' }] }
        ],
        transaction
      });

      for (const packProduct of packProducts) {
        // Get unit from PackProduct first, then fallback to Product's UnitType
        const unit = packProduct.UnitType?.abbreviation || packProduct.Product?.UnitType?.abbreviation || '';
        await OrderPackContent.create({
          orderId: newOrder.id,
          productId: packProduct.productId,
          productName: packProduct.Product.name,
          quantity: packProduct.quantity,
          unit: unit,
          unitPrice: packProduct.unitPrice
        }, { transaction });
      }
    }

    await transaction.commit();

    // Handle wallet payment - deduct credits from wallet
    let walletBalance = null;
    if (paymentMethod === 'wallet') {
      try {
        const wallet = await Wallet.findOne({ where: { userId } });
        
        if (!wallet) {
          console.error('Wallet not found for user:', userId);
        } else if (parseFloat(wallet.balance) < parseFloat(totalAmount)) {
          console.error('Insufficient wallet balance for user:', userId, 'Balance:', wallet.balance, 'Required:', totalAmount);
        } else {
          // Deduct from wallet
          const newBalance = parseFloat(wallet.balance) - parseFloat(totalAmount);
          
          await wallet.update({
            balance: newBalance,
            totalCreditsSpent: parseFloat(wallet.totalCreditsSpent || 0) + parseFloat(totalAmount)
          });

          // Create wallet transaction record
          await WalletTransaction.create({
            walletId: wallet.id,
            userId,
            type: 'credit_spent',
            amount: -parseFloat(totalAmount),
            balanceBefore: wallet.balance + parseFloat(totalAmount),
            balanceAfter: newBalance,
            orderId: newOrder.id,
            description: `Spent ${totalAmount} credits for order #${newOrder.id}`,
            status: 'completed'
          });

          walletBalance = newBalance;
          console.log(`✅ Wallet deducted: ${totalAmount} credits for order #${newOrder.id}. New balance: ${newBalance}`);
        }
      } catch (walletError) {
        console.error('Error processing wallet payment:', walletError);
        // Don't fail the order, but log the error
      }
    }

    // Create notification for admin about new order
    try {
      await Notification.create({
        type: 'order',
        title: 'New Order Placed',
        message: `New order #${newOrder.id} has been placed by user ${userId} for ₹${totalAmount}`,
        referenceId: newOrder.id,
        referenceType: 'order',
        actionRequired: true,
        priority: 'high'
      });
    } catch (notifError) {
      console.error('Error creating order notification:', notifError);
      // Don't fail the order if notification fails
    }

    // Clear user's cart after successful order
    console.log(`Attempting to clear cart for userId: ${userId}, orderId: ${newOrder.id}`);
    try {
      // First check what carts exist
      const beforeCarts = await Cart.findAll({ where: { userId } });
      console.log(`Found ${beforeCarts.length} carts for user ${userId}:`, beforeCarts.map(c => ({ id: c.id, isActive: c.isActive })));
      
      const [updateCount] = await Cart.update(
        { isActive: false },
        { where: { userId, isActive: true } }
      );
      console.log(`Cart cleared for user ${userId} after order ${newOrder.id}, affected rows: ${updateCount}`);
    } catch (cartError) {
      console.error('Error clearing cart:', cartError);
      // Don't fail the order if cart clearing fails
    }

    res.status(201).json({
      ...newOrder.toJSON(),
      razorpayOrderId,
      walletBalance
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
