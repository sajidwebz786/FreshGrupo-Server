require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

/* =========================
   RAZORPAY INIT
========================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* =========================
   DB INIT
========================= */
let modelsLoaded = false;

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    global.models = db;
    Object.assign(global, db);

    await db.sequelize.sync({ alter: true });
    console.log('📦 Database synced');

    global.seedDatabase = require('./seeders/seedData');
    modelsLoaded = true;
  } catch (err) {
    console.error('❌ DB init failed:', err);
  }
})();

/* =========================
   ROUTES
========================= */
app.use('/api/orders', require('./routes/orders')); // Razorpay handled here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/public', require('./routes/public'));
app.use('/api/cart', require('./routes/cart'));

/* =========================
   BASIC ROUTES
========================= */
app.get('/', (req, res) => {
  res.json({ message: 'Fresh Grupo API running 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

/* =========================
   JWT AUTH MIDDLEWARE
========================= */
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

/* =========================
   CATEGORY CRUD
========================= */
app.get('/api/categories', async (_, res) => {
  res.json(await Category.findAll());
});

app.post('/api/categories', async (req, res) => {
  res.status(201).json(await Category.create(req.body));
});

/* =========================
   PRODUCT CRUD
========================= */
app.get('/api/products', async (_, res) => {
  res.json(
    await Product.findAll({
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: UnitType, attributes: ['id', 'name', 'abbreviation'] },
      ],
    })
  );
});

/* =========================
   PACK ROUTES
========================= */
app.get('/api/packs', async (_, res) => {
  res.json(
    await Pack.findAll({
      include: [
        { model: Category, attributes: ['name'] },
        { model: PackType, attributes: ['name', 'duration'] },
        {
          model: Product,
          through: { attributes: ['quantity', 'unitPrice'] },
        },
      ],
    })
  );
});

/* =========================
   PAYMENTS (ADMIN / REPORT)
========================= */
app.get('/api/payments', async (_, res) => {
  res.json(
    await Payment.findAll({
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Order, attributes: ['id'] },
      ],
    })
  );
});

/* =========================
   ERROR HANDLERS
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* =========================
   SERVER START
========================= */
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  const start = Date.now();
  while (!modelsLoaded && Date.now() - start < 10000) {
    await new Promise(r => setTimeout(r, 100));
  }

  if (modelsLoaded && process.env.SEED_ON_STARTUP === 'true') {
    try {
      console.log('🌱 Seeding database...');
      await global.seedDatabase(true);
      console.log('✅ Seed complete');
    } catch (e) {
      console.error('❌ Seed failed', e);
    }
  }
});

module.exports = app;
