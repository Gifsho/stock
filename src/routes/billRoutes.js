const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.get('/transactions', billController.getTransactions);
router.post('/transactions', billController.addTransaction);
router.put('/transactions/:id', billController.updateTransaction);
router.delete('/transactions/:id', billController.deleteTransaction);

router.get('/goals', billController.getGoals);
router.post('/goals', billController.addGoal);
router.delete('/goals/:id', billController.deleteGoal);

module.exports = router;
