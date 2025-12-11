const User = require('../models/User');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    // Get user's profile with pincode
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      pincode: user.pincode
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Update user pincode
const updateUserPincode = async (req, res) => {
  try {
    const { pincode } = req.body;
    
    // Validate pincode format (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Valid 6-digit pincode is required' });
    }
    
    // Update user's pincode
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { pincode },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      pincode: updatedUser.pincode
    });
  } catch (error) {
    console.error('Error updating user pincode:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating pincode' });
  }
};

module.exports = {
  getUserProfile,
  updateUserPincode
};