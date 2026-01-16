require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('./models');

// ==============================
// Razorpay Initialization
// ==============================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_your_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret",
});

// ✅ FIX: make razorpay globally accessible
global.razorpay = razorpay;

const app = express();
const PORT = process.env.PORT || 3001;

// ==============================
// Middleware
// ==============================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Cloudinary storage configuration
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name') {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'fresh-grupo',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    }
  });
} else {
  // Fallback to memory storage if Cloudinary not configured
  storage = multer.memoryStorage();
}

const upload = multer({ storage: storage });

// ==============================
// Database Init and Server Start
// ==============================
(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

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
    global.Address = db.Address;

    console.log('🔗 Associations already applied.');

    await db.sequelize.sync({ alter: true });
    console.log('📦 Database synced.');

    global.seedDatabase = require('./seeders/seedData');

    // ==============================
    // Routes
    // ==============================
    app.use('/api/orders', require('./routes/orders'));
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/public', require('./routes/public'));
    app.use('/api/cart', require('./routes/cart'));
    app.use('/api/addresses', require('./routes/addresses'));

     app.use('/api/users', require('./routes/users'));
    // ==============================
    // Health & Base
    // ==============================
    app.get('/', (_, res) => {
      res.json({ message: 'Fresh Grupo API Server is running!' });
    });

    app.get('/health', (_, res) => {
      res.json({ status: 'OK', time: new Date().toISOString() });
    });

    // ==============================
    // Category Routes
    // ==============================
    app.get('/api/categories', async (_, res) => {
      try {
        res.json(await Category.findAll());
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/categories', upload.single('image'), async (req, res) => {
      try {
        const categoryData = { ...req.body };
        if (req.file) {
          if (req.file.path) {
            categoryData.image = req.file.path; // Cloudinary URL
          } else {
            // Memory storage, skip image for now
            console.log('Image uploaded to memory, skipping save');
          }
        }
        const category = await Category.create(categoryData);
        res.json(category);
      } catch (e) {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
          res.status(400).json({ error: e.errors ? e.errors.map(err => err.message).join(', ') : e.message });
        } else {
          res.status(500).json({ error: e.message });
        }
      }
    });

    app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }
        const categoryData = { ...req.body };
        if (req.file) {
          if (req.file.path) {
            categoryData.image = req.file.path; // Cloudinary URL
          } else {
            // Memory storage, skip image for now
            console.log('Image uploaded to memory, skipping save');
          }
        }
        const [updated] = await Category.update(categoryData, { where: { id: categoryId } });
        if (updated) {
          const category = await Category.findByPk(categoryId);
          res.json(category);
        } else {
          res.status(404).json({ error: 'Category not found' });
        }
      } catch (e) {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
          res.status(400).json({ error: e.errors ? e.errors.map(err => err.message).join(', ') : e.message });
        } else {
          res.status(500).json({ error: e.message });
        }
      }
    });

    app.delete('/api/categories/:id', async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }
        const deleted = await Category.destroy({ where: { id: categoryId } });
        if (deleted) {
          res.json({ message: 'Category deleted' });
        } else {
          res.status(404).json({ error: 'Category not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Unit Type Routes
    // ==============================
    app.get('/api/unit-types', async (_, res) => {
      try {
        res.json(await UnitType.findAll());
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/unit-types', async (req, res) => {
      try {
        const unitType = await UnitType.create(req.body);
        res.json(unitType);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/unit-types/:id', async (req, res) => {
      try {
        const [updated] = await UnitType.update(req.body, { where: { id: req.params.id } });
        if (updated) {
          const unitType = await UnitType.findByPk(req.params.id);
          res.json(unitType);
        } else {
          res.status(404).json({ error: 'UnitType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/unit-types/:id', async (req, res) => {
      try {
        const deleted = await UnitType.destroy({ where: { id: req.params.id } });
        if (deleted) {
          res.json({ message: 'UnitType deleted' });
        } else {
          res.status(404).json({ error: 'UnitType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Product Routes
    // ==============================
    app.get('/api/products', async (_, res) => {
      try {
        const products = await Product.findAll({
          include: [
            { model: Category },
            { model: UnitType }
          ],
        });
        res.json(products);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/products', upload.single('image'), async (req, res) => {
      try {
        const productData = { ...req.body };
        if (req.file) {
          productData.image = req.file.path; // Cloudinary URL
        }
        const product = await Product.create(productData);
        res.json(product);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/products/:id', upload.single('image'), async (req, res) => {
      try {
        const productData = { ...req.body };
        if (req.file) {
          productData.image = req.file.path; // Cloudinary URL
        }
        const [updated] = await Product.update(productData, { where: { id: req.params.id } });
        if (updated) {
          const product = await Product.findByPk(req.params.id, {
            include: [
              { model: Category },
              { model: UnitType }
            ],
          });
          res.json(product);
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/products/:id', async (req, res) => {
      try {
        const deleted = await Product.destroy({ where: { id: req.params.id } });
        if (deleted) {
          res.json({ message: 'Product deleted' });
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Pack Routes (IMPORTANT)
    // ==============================
    app.get('/api/packs', async (_, res) => {
      try {
        const packs = await Pack.findAll({
          include: [
            { model: Category },
            { model: PackType },
            {
              model: Product,
              through: { attributes: ['quantity', 'unitPrice'] },
              include: [UnitType],
            },
          ],
        });
        res.json(packs);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.get('/api/packs/:id', async (req, res) => {
      try {
        const packId = parseInt(req.params.id);
        if (isNaN(packId)) {
          return res.status(400).json({ error: 'Invalid pack ID' });
        }

        const pack = await Pack.findByPk(packId, {
          include: [
            { model: Category },
            { model: PackType },
            {
              model: Product,
              through: { attributes: ['quantity', 'unitPrice'] },
              include: [UnitType],
            },
          ],
        });

        if (!pack) {
          return res.status(404).json({ error: 'Pack not found' });
        }

        res.json(pack);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/packs', async (req, res) => {
      try {
        const pack = await Pack.create(req.body);
        res.json(pack);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/packs/:id', async (req, res) => {
      try {
        const [updated] = await Pack.update(req.body, { where: { id: req.params.id } });
        if (updated) {
          const pack = await Pack.findByPk(req.params.id, {
            include: [
              { model: Category },
              { model: PackType },
              {
                model: Product,
                through: { attributes: ['quantity', 'unitPrice'] },
                include: [UnitType],
              },
            ],
          });
          res.json(pack);
        } else {
          res.status(404).json({ error: 'Pack not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/packs/:id', async (req, res) => {
      try {
        const deleted = await Pack.destroy({ where: { id: req.params.id } });
        if (deleted) {
          res.json({ message: 'Pack deleted' });
        } else {
          res.status(404).json({ error: 'Pack not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Pack Type Routes
    // ==============================
    app.get('/api/pack-types', async (_, res) => {
      try {
        res.json(await PackType.findAll());
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/pack-types', async (req, res) => {
      try {
        const packType = await PackType.create(req.body);
        res.json(packType);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/pack-types/:id', async (req, res) => {
      try {
        const [updated] = await PackType.update(req.body, { where: { id: req.params.id } });
        if (updated) {
          const packType = await PackType.findByPk(req.params.id);
          res.json(packType);
        } else {
          res.status(404).json({ error: 'PackType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/pack-types/:id', async (req, res) => {
      try {
        const deleted = await PackType.destroy({ where: { id: req.params.id } });
        if (deleted) {
          res.json({ message: 'PackType deleted' });
        } else {
          res.status(404).json({ error: 'PackType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Pack Product Routes
    // ==============================
    app.post('/api/pack-products/bulk', async (req, res) => {
      try {
        const { packId, products } = req.body;
        const packProducts = products.map(p => ({
          packId,
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        }));
        const created = await PackProduct.bulkCreate(packProducts);
        res.json(created);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.get('/api/packs/:packId/products', async (req, res) => {
      try {
        const packProducts = await PackProduct.findAll({
          where: { packId: req.params.packId },
          include: [Product],
        });
        res.json(packProducts);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/packs/:packId/products', async (req, res) => {
      try {
        await PackProduct.destroy({ where: { packId: req.params.packId } });
        res.json({ message: 'Pack products deleted' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Razorpay Routes (UNCHANGED)
    // ==============================
    app.post('/api/create-razorpay-order', async (req, res) => {
      try {
        const { amount, orderId } = req.body;

        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: `order_${orderId}`,
          payment_capture: 1,
        });

        await Order.update(
          { paymentStatus: 'processing' },
          { where: { id: orderId } }
        );

        res.json({
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        });

      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/verify-payment', async (req, res) => {
      try {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
          amount,
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(body)
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ message: 'Invalid signature' });
        }

        await Payment.create({
          orderId,
          amount,
          paymentMethod: 'razorpay',
          status: 'completed',
          transactionId: razorpay_payment_id,
        });

        await Order.update(
          { paymentStatus: 'completed', status: 'confirmed' },
          { where: { id: orderId } }
        );

        res.json({ success: true });

      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Error Handlers
    // ==============================
    app.use((err, req, res, next) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      }
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.use((_, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // ==============================
    // Server Start
    // ==============================
    app.listen(PORT, '0.0.0.0', async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`SEED_ON_STARTUP: ${process.env.SEED_ON_STARTUP}`);

      if (process.env.SEED_ON_STARTUP === 'true') {
        console.log('🌱 Starting database seeding...');
        try {
          await global.seedDatabase(false); // Don't force
          console.log('✅ Database seeding completed');
        } catch (error) {
          console.error('❌ Database seeding failed:', error);
        }
      }
    });

  } catch (err) {
    console.error('❌ Database init failed:', err);
    process.exit(1);
  }
})();

module.exports = app;
