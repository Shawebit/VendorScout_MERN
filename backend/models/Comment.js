const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 280 // Twitter-like limit
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true, // Make pincode compulsory
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: props => 'Pincode must be a 6-digit number'
    }
  },
  likes: {
    type: Number,
    default: 0
  },
  // Track which users have liked this comment
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  vendor: {
    type: String,
    trim: true
  },
  // Add reference to specific vendor profile
  vendorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
commentSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Comment', commentSchema);