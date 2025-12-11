const User = require('../models/User');
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, phoneNumber, pincode } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Validate required fields
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Valid 6-digit pincode is required' });
    }

    // Validate vendor-specific fields
    if (role === 'vendor') {
      if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Valid 10-digit phone number is required for vendors' });
      }
    }

    // Hash password
    const hashedPassword = await User.hashPassword(password);

    // Create user with vendor-specific fields if applicable
    const userData = {
      username,
      email,
      password: hashedPassword,
      role: role || 'customer',
      pincode
    };

    // Add vendor-specific fields if role is vendor
    if (role === 'vendor') {
      userData.phoneNumber = phoneNumber;
    }

    const user = await User.create(userData);

    // If user is a vendor, create a vendor profile
    let vendorProfile = null;
    if (role === 'vendor') {
      const vendor = new Vendor({
        user: user._id,
        businessName: `${username}'s Business`,
        cuisineType: 'Street Food',
        phoneNumber: phoneNumber,
        pincode: pincode
      });
      
      vendorProfile = await vendor.save();
      
      // Update user with vendor profile reference
      user.vendorProfile = vendorProfile._id;
      await user.save();
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    // Prepare response data
    const responseData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      pincode: user.pincode,
      token
    };

    // Add vendor-specific fields to response if applicable
    if (user.role === 'vendor' && vendorProfile) {
      responseData.phoneNumber = user.phoneNumber;
      responseData.vendorProfile = vendorProfile;
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    let user;
    
    // Find user by email or phone number based on which field is provided
    if (email) {
      // Customer login with email
      user = await User.findOne({ email });
      
      // Ensure this is a customer account
      if (user && user.role !== 'customer') {
        return res.status(401).json({ message: 'Please use phone number to login as a vendor' });
      }
    } else if (phoneNumber) {
      // Vendor login with phone number
      user = await User.findOne({ phoneNumber });
      
      // Ensure this is a vendor account
      if (user && user.role !== 'vendor') {
        return res.status(401).json({ message: 'Please use email to login as a customer' });
      }
    } else {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    // Prepare response data
    const responseData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      pincode: user.pincode,
      token
    };

    // Add vendor-specific fields to response if applicable
    if (user.role === 'vendor') {
      responseData.phoneNumber = user.phoneNumber;
      
      // Populate vendor profile if exists
      if (user.vendorProfile) {
        const vendorProfile = await Vendor.findById(user.vendorProfile);
        responseData.vendorProfile = vendorProfile;
      } else {
        // If vendor profile doesn't exist but user is a vendor, create one
        const vendor = await Vendor.findOne({ user: user._id });
        if (vendor) {
          // Update user with vendor profile reference
          user.vendorProfile = vendor._id;
          await user.save();
          responseData.vendorProfile = vendor;
        } else {
          // Create a basic vendor profile
          const newVendor = new Vendor({
            user: user._id,
            businessName: `${user.username}'s Business`,
            cuisineType: 'Street Food',
            phoneNumber: user.phoneNumber,
            pincode: user.pincode
          });
          
          const savedVendor = await newVendor.save();
          
          // Update user with vendor profile reference
          user.vendorProfile = savedVendor._id;
          await user.save();
          
          responseData.vendorProfile = savedVendor;
        }
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
const logoutUser = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};