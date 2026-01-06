require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Sync database
db.sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
}).catch((error) => {
  console.error('Error syncing database:', error);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
