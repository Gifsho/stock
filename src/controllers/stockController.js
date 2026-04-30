const stockService = require('../services/stockService');

class StockController {
  async getAllStock(req, res, next) {
    try {
      const { page, limit, search, sortBy, order } = req.query;
      const result = await stockService.getAll(page, limit, search, sortBy, order);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createStock(req, res, next) {
    try {
      const result = await stockService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const result = await stockService.update(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteStock(req, res, next) {
    try {
      const { id } = req.params;
      const result = await stockService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StockController();
