const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure a customer can only rate a vendor once
ratingSchema.index({ customer: 1, vendor: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);