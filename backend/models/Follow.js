const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  followedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a customer can only follow a vendor once
followSchema.index({ customer: 1, vendor: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);