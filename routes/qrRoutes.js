const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/:filename', qrController.serveQRCode);

// Protected routes (require authentication)
router.post('/menu', authMiddleware, qrController.generateMenuQR);
router.post('/tables/:tableId', qrController.generateTableQR);

module.exports = router;