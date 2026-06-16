const billService = require('../services/billService');

async function getTransactions(req, res) {
  try {
    const result = await billService.getAllTransactions();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addTransaction(req, res) {
  try {
    const result = await billService.createTransaction(req.body);
    res.status(201).json({ status: 'ok', id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const result = await billService.updateTransaction(id, req.body);
    res.json({ status: 'ok', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const result = await billService.deleteTransaction(id);
    res.json({ status: 'ok', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getGoals(req, res) {
  try {
    const goals = await billService.getAllGoals();
    res.json({ data: goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addGoal(req, res) {
  try {
    const result = await billService.createGoal(req.body);
    res.status(201).json({ status: 'ok', id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteGoal(req, res) {
  try {
    const { id } = req.params;
    const result = await billService.deleteGoal(id);
    res.json({ status: 'ok', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getGoals,
  addGoal,
  deleteGoal,
};
