const mongoose = require('mongoose');

const broadcastMessageSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280 // Twitter-like limit
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  recipients: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BroadcastMessage', broadcastMessageSchema);