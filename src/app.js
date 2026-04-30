const express = require('express');
const cors = require('cors');
const stockRoutes = require('./routes/stockRoutes');
const activityRoutes = require('./routes/activityRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stock', stockRoutes);
app.use('/api/activities', activityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;
