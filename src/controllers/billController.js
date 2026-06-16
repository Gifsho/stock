const billService = require('../services/billService');

class BillController {
  async getTransactions(req, res, next) {
    try {
      const result = await billService.getAllTransactions();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addTransaction(req, res, next) {
    try {
      const result = await billService.createTransaction(req.body);
      res.status(201).json({ status: 'ok', id: result.id });
    } catch (error) {
      next(error);
    }
  }

  async updateTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const result = await billService.updateTransaction(id, req.body);
      res.json({ status: 'ok', ...result });
    } catch (error) {
      next(error);
    }
  }

  async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const result = await billService.deleteTransaction(id);
      res.json({ status: 'ok', ...result });
    } catch (error) {
      next(error);
    }
  }

  async getGoals(req, res, next) {
    try {
      const goals = await billService.getAllGoals();
      res.json({ data: goals });
    } catch (error) {
      next(error);
    }
  }

  async addGoal(req, res, next) {
    try {
      const result = await billService.createGoal(req.body);
      res.status(201).json({ status: 'ok', id: result.id });
    } catch (error) {
      next(error);
    }
  }

  async deleteGoal(req, res, next) {
    try {
      const { id } = req.params;
      const result = await billService.deleteGoal(id);
      res.json({ status: 'ok', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BillController();
