// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const { pool } = require('./db');

const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/family');
const memberRoutes = require('./routes/member');
const anbiyamRoutes = require('./routes/anbiyam');
const syncRoutes = require('./routes/sync');
const userRoutes = require('./routes/user');
const familyUserRoutes = require('./routes/familyUserRoutes');
const inchargeRoutes = require('./routes/inchargeRoutes');
const adminPanelRoutes = require('./routes/adminPanelRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/anbiyam', anbiyamRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/user', userRoutes);
app.use('/api/family-user', familyUserRoutes);
app.use('/api/incharge', inchargeRoutes);
app.use('/api/admin-panel', adminPanelRoutes);

// Catch undefined routes
const AppError = require('./utils/AppError');
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

pool
  .connect()
  .then((client) => {
    client.release();
    console.log('✅ Connected to Neon PostgreSQL');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Neon DB connection failed:', err.message);
    process.exit(1);
  });
