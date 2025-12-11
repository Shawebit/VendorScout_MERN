const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  cuisineType: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  images: {
    type: [{
      url: {
        type: String,
        required: true
      },
      publicId: String // For Cloudinary or similar services
    }],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: props => `You can only upload up to 5 images. Currently trying to save ${props.value.length} images.`
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'relocating', 'sold_out'],
    default: 'closed'
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual field for follower count
vendorSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual field for average rating
vendorSchema.virtual('averageRating').get(function() {
  return this.ratings ? this.ratings.average : 0;
});

// Virtual field for rating count
vendorSchema.virtual('ratingCount').get(function() {
  return this.ratings ? this.ratings.count : 0;
});

// Virtual field for average menu price - optimized version
vendorSchema.virtual('averageMenuPrice').get(function() {
  // This will be populated in the controller for better performance
  return this._averageMenuPrice || 0;
});

// Ensure virtual fields are serialized
vendorSchema.set('toJSON', {
  virtuals: true
});

// Update the updatedAt field before saving
vendorSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Vendor', vendorSchema);