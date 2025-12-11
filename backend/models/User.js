const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'vendor'],
    default: 'customer'
  },
  phoneNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Only indexed when present
    validate: {
      validator: function(v) {
        // Only required for vendors
        if (this.role === 'vendor') {
          return v && /^\d{10}$/.test(v);
        }
        return true; // Not required for customers
      },
      message: props => 'Phone number must be a 10-digit number for vendors'
    }
  },
  pincode: {
    type: String,
    required: true, // Make pincode required for all users
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: props => 'Pincode must be a 6-digit number'
    }
  },
  vendorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }
}, {
  timestamps: true
});

// Hash password before saving (moved to controller)
userSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);