const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
    enum: ['main dining', 'patio', 'private room', 'bar'],
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'occupied', 'reserved', 'out of service'],
    default: 'available',
  },
  assignedServer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  qrCode: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

tableSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Table', tableSchema);