const express = require('express');
const cors = require('cors');
const stockRoutes = require('./routes/stockRoutes');
const activityRoutes = require('./routes/activityRoutes');
const billRoutes = require('./routes/billRoutes');
const accountRoutes = require('./routes/accountRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stock', stockRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/bill/accounts', accountRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
