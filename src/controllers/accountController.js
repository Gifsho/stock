const accountService = require('../services/accountService');

async function getAll(req, res) {
  try {
    const accounts = await accountService.getAll();
    res.json({ data: accounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function create(req, res) {
  try {
    const result = await accountService.create(req.body);
    res.status(201).json({ status: 'ok', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const result = await accountService.update(id, req.body);
    res.json({ status: 'ok', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const result = await accountService.delete(id);
    res.json({ status: 'ok', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAll, create, update, remove };
