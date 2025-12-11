const mongoose = require('mongoose');

const pincodeLocationSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  officename: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  }
});

// Create a 2dsphere index for geospatial queries
pincodeLocationSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('PincodeLocation', pincodeLocationSchema);