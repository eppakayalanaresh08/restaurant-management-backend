const qr = require('qr-image');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const generateQRCode = (data, type = 'table') => {
  try {
    // Create a unique filename
    const filename = `${type}_${uuidv4()}.png`;
    const filepath = path.join(__dirname, '../public/qrcodes', filename);
    
    // Generate QR code
    const qr_png = qr.image(data, { type: 'png' });
    const writeStream = fs.createWriteStream(filepath);
    
    qr_png.pipe(writeStream);
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(filename));
      writeStream.on('error', reject);
    });
  } catch (error) {
    throw error;
  }
};

module.exports = generateQRCode;