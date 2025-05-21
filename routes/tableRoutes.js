const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', tableController.getAllTables);
router.get('/:id', tableController.getTableById);

router.get('/:id/qr', tableController.getTableQR);
router.get('/availability/check', tableController.checkAvailability);

// Protected routes (require authentication)
router.post('/',  tableController.createTable);
router.put('/:id', tableController.updateTable);
router.put('/:id/status', tableController.updateTableStatus);
router.put('/:id/assign', authMiddleware, tableController.assignServer);
router.post('/reservations', authMiddleware, tableController.createReservation);

router.delete('/:id', tableController.deleteTable);

module.exports = router;