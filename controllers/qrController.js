const generateQRCode = require('../utils/generateQR');
const path = require('path');
const Table = require('../models/Table');
const { BASE_URL } = process.env;

// Generate QR code for menu
exports.generateMenuQR = async (req, res) => {
  try {
    const menuUrl = `${BASE_URL}/api/menu`;
    const qrFilename = await generateQRCode(menuUrl, 'menu');
    
    res.status(201).json({
      message: 'Menu QR code generated successfully',
      qrCode: qrFilename,
      url: menuUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating menu QR code', error: error.message });
  }
};

// Generate QR code for table-specific actions
exports.generateTableQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }
    
    const tableUrl = `${BASE_URL}/api/tables/${table._id}/actions`;
    const qrFilename = await generateQRCode(tableUrl, 'table-actions');
    
    res.status(201).json({
      message: 'Table QR code generated successfully',
      qrCode: qrFilename,
      url: tableUrl,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating table QR code', error: error.message });
  }
};

// Serve QR code image
exports.serveQRCode = (req, res) => {
  try {
    const { filename } = req.params;
    res.sendFile(path.join(__dirname, '../public/qrcodes', filename));
  } catch (error) {
    res.status(500).json({ message: 'Error serving QR code', error: error.message });
  }
};