const express = require('express');
const router = express.Router();

router.get('/rate', async (req, res) => {
  try {
    const response = await fetch('https://fxapi.app/api/USD/THB.json');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

module.exports = router;
