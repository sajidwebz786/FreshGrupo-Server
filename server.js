require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('./models');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_your_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret",
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database connection and sync models
let modelsLoaded = false;

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Models are already loaded in db
    global.models = db;
    global.User = db.User;
    global.Category = db.Category;
    global.Product = db.Product;
    global.UnitType = db.UnitType;
    global.PackType = db.PackType;
    global.Pack = db.Pack;
    global.PackProduct = db.PackProduct;
    global.Cart = db.Cart;
    global.Order = db.Order;
    global.Payment = db.Payment;

    console.log('🔗 Associations already applied in models/index.js.');

    // Sync database AFTER models load
    await db.sequelize.sync();

    console.log('📦 Database synced with models.');

    // Load seed function
    global.seedDatabase = require('./seeders/seedData');

    modelsLoaded = true;

  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
})();

// Routes
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const cartRoutes = require('./routes/cart');
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/cart', cartRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Fresh Groupo API Server is running!" });
});

// API base route
app.get("/api", (req, res) => {
  res.json({
    message: "Fresh Groupo API Server is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
      packs: "/api/packs",
      cart: "/api/cart",
      orders: "/api/orders",
      payments: "/api/payments",
      public: "/api/public",
    },
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Seed database route
app.post("/api/seed", async (req, res) => {
  try {
    console.log("Seeding database...");
    await seedDatabase();
    console.log("Database seeded successfully");
    res.json({ message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Error seeding database:", error);
    res.status(500).json({ error: error.message });
  }
});

// Force sync and seed database
app.post("/api/force-sync", async (req, res) => {
  try {
    console.log("Force syncing database...");
    await db.sequelize.sync({ force: true });
    console.log("Database synced, now seeding...");
    await seedDatabase();
    console.log("Database force synced and seeded successfully");
    res.json({ message: "Database force synced and seeded successfully!" });
  } catch (error) {
    console.error("Error force syncing database:", error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// Category CRUD routes
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.update(req.body);
      res.json(category);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.destroy();
      res.json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product CRUD routes
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: UnitType, attributes: ['id', 'name', 'abbreviation'] }
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category, UnitType],
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const productWithCategory = await Product.findByPk(product.id, {
      include: [Category],
    });
    res.status(201).json(productWithCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update(req.body);
      const updatedProduct = await Product.findByPk(product.id, {
        include: [Category],
      });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management routes
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ["password"] },
      });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:id/status", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update({ isActive: !user.isActive });
      res.json({ message: "User status updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pack routes
app.get("/api/packs", async (req, res) => {
  try {
    const packs = await Pack.findAll({
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
        {
          model: Product,
          through: { attributes: ["quantity", "unitPrice"] },
          attributes: ["name", "price"],
        },
      ],
    });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/packs/:id", async (req, res) => {
  try {
    const pack = await Pack.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
        {
          model: Product,
          through: { attributes: ["quantity", "unitPrice"] },
          attributes: ["name", "price"],
          include: [UnitType],
        },
      ],
    });
    if (pack) {
      res.json(pack);
    } else {
      res.status(404).json({ error: "Pack not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/packs", async (req, res) => {
  try {
    const pack = await Pack.create(req.body);
    res.status(201).json(pack);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/packs/:id", async (req, res) => {
  try {
    const pack = await Pack.findByPk(req.params.id);
    if (pack) {
      await pack.update(req.body);
      res.json(pack);
    } else {
      res.status(404).json({ error: "Pack not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/packs/:id", async (req, res) => {
  try {
    const pack = await Pack.findByPk(req.params.id);
    if (pack) {
      // Delete associated pack products first
      await PackProduct.destroy({ where: { packId: req.params.id } });
      await pack.destroy();
      res.json({ message: "Pack deleted successfully" });
    } else {
      res.status(404).json({ error: "Pack not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment routes
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Order, attributes: ["id"] },
      ],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // Get order details
    const order = await Order.findByPk(orderId, { include: [User] });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create payment
    const payment = await Payment.create({
      orderId,
      userId: order.userId,
      amount: order.totalAmount,
      paymentMethod,
      status: "completed", // For demo purposes
      transactionId: "TXN_" + Date.now(),
    });

    // Update order payment status
    await order.update({ paymentStatus: "completed" });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Razorpay payment routes
app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${orderId}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID
    await Order.update(
      { paymentStatus: "processing" },
      { where: { id: orderId } }
    );

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "your_key_secret"
      )
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      const payment = await Payment.create({
        orderId,
        userId: req.user.id,
        amount: req.body.amount,
        paymentMethod: "card",
        status: "completed",
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        gatewayResponse: JSON.stringify(req.body),
      });

      // Update order status
      await Order.update(
        { paymentStatus: "completed", status: "confirmed" },
        { where: { id: orderId } }
      );

      res.json({ status: "success", payment });
    } else {
      // Payment verification failed
      await Payment.create({
        orderId,
        userId: req.user.id,
        amount: req.body.amount,
        paymentMethod: "card",
        status: "failed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        gatewayResponse: JSON.stringify(req.body),
      });

      res
        .status(400)
        .json({ status: "failed", message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, "0.0.0.0", async () => {
  // Wait for models to be loaded before seeding
  const maxWaitTime = 10000; // 10 seconds
  const startTime = Date.now();

  while (!modelsLoaded && Date.now() - startTime < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (modelsLoaded) {
    if (process.env.SEED_ON_STARTUP === "true") {
      try {
        console.log("🌱 Starting database seeding...");
        await global.seedDatabase(true); // Force seed when SEED_ON_STARTUP=true
        console.log("✅ Database seeded successfully on startup");
      } catch (error) {
        console.error("❌ Error seeding database on startup:", error);
      }
    } else {
      console.log("ℹ Database seeding skipped (SEED_ON_STARTUP=false).");
    }
  } else {
    console.error("❌ Models not loaded within timeout period");
  }
});

module.exports = app;
