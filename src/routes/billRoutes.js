const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.get('/transactions', billController.getAllTransactions);
router.post('/transactions', billController.createTransaction);
router.patch('/transactions/:id', billController.updateTransaction);
router.delete('/transactions/:id', billController.deleteTransaction);

router.get('/goals', billController.getAllGoals);
router.post('/goals', billController.createGoal);
router.delete('/goals/:id', billController.deleteGoal);

module.exports = router;
