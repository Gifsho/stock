const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getAllStock);
router.post('/', stockController.createStock);
router.patch('/:id', stockController.updateStock);
router.delete('/:id', stockController.deleteStock);

module.exports = router;
