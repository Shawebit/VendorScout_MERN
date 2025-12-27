const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const BroadcastMessage = require('../models/BroadcastMessage');
const Follow = require('../models/Follow');
const User = require('../models/User');
const Rating = require('../models/Rating');
const PincodeLocation = require('../models/PincodeLocation');

// Create a new vendor profile
const createVendorProfile = async (req, res) => {
  try {
    const { businessName, cuisineType, description, phoneNumber, pincode, address, images } = req.body;
    
    // Check if vendor profile already exists for this user
    const existingVendor = await Vendor.findOne({ user: req.user.id });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor profile already exists for this user' });
    }
    
    // Validate required fields
    if (!businessName || !cuisineType || !phoneNumber || !pincode) {
      return res.status(400).json({ message: 'Business name, cuisine type, phone number, and pincode are required' });
    }
    
    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    
    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be 6 digits' });
    }
    
    // Validate image count
    if (images && images.length > 5) {
      return res.status(400).json({ message: 'You can only have up to 5 images' });
    }
    
    // Validate image URLs if provided
    if (images) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image.url || typeof image.url !== 'string') {
          return res.status(400).json({ message: 'Each image must have a valid URL' });
        }
        // Basic URL validation
        try {
          new URL(image.url);
        } catch (err) {
          return res.status(400).json({ message: `Invalid image URL: ${image.url}` });
        }
      }
    }
    
    // Create vendor profile
    const vendor = new Vendor({
      user: req.user.id,
      businessName,
      cuisineType,
      description,
      phoneNumber,
      pincode,
      address,
      images: images || []
    });
    
    const savedVendor = await vendor.save();
    
    // Update user with vendor profile reference
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { 
      vendorProfile: savedVendor._id 
    }, { new: true });
      
    // Update req.user with the vendor profile reference
    if (req.user) {
      req.user.vendorProfile = savedVendor._id;
    }
    
    res.status(201).json(savedVendor);
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    res.status(500).json({ message: 'Server error while creating vendor profile' });
  }
};

// Update vendor profile
const updateVendorProfile = async (req, res) => {
  try {
    const { businessName, cuisineType, description, phoneNumber, pincode, address, images, status } = req.body;
    
    // Find vendor profile for this user
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // Validate required fields if provided
    if (businessName !== undefined && !businessName) {
      return res.status(400).json({ message: 'Business name is required' });
    }
    
    if (cuisineType !== undefined && !cuisineType) {
      return res.status(400).json({ message: 'Cuisine type is required' });
    }
    
    if (phoneNumber !== undefined) {
      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
      }
      vendor.phoneNumber = phoneNumber;
    }
    
    if (pincode !== undefined) {
      // Validate pincode (6 digits)
      if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({ message: 'Pincode must be 6 digits' });
      }
      vendor.pincode = pincode;
    }
    
    // Handle images - limit to 5 images
    if (images !== undefined) {
      if (images.length > 5) {
        return res.status(400).json({ message: 'You can only have up to 5 images' });
      }
      
      // Validate image URLs
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image.url || typeof image.url !== 'string') {
          return res.status(400).json({ message: 'Each image must have a valid URL' });
        }
        // Basic URL validation
        try {
          new URL(image.url);
        } catch (err) {
          return res.status(400).json({ message: `Invalid image URL: ${image.url}` });
        }
      }
      
      vendor.images = images;
    }
    
    // Update other fields if provided
    if (businessName !== undefined) vendor.businessName = businessName;
    if (cuisineType !== undefined) vendor.cuisineType = cuisineType;
    if (description !== undefined) vendor.description = description;
    if (status !== undefined) vendor.status = status;
    
    const updatedVendor = await vendor.save();
    res.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error while updating vendor profile' });
  }
};

// Get vendor profile
const getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.params.vendorId || req.user.id;
    
    let vendor;
    if (req.params.vendorId) {
      // Get specific vendor by ID
      vendor = await Vendor.findById(vendorId).populate('user', 'username email');
    } else {
      // Get current user's vendor profile
      vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'username email');
    }
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // Try to find officename based on pincode
    const pincodeRecord = await PincodeLocation.findOne({ pincode: vendor.pincode });
    if (pincodeRecord && pincodeRecord.officename) {
      // Add officename to the response
      const vendorObject = vendor.toObject();
      vendorObject.officename = pincodeRecord.officename;
      res.json(vendorObject);
    } else {
      res.json(vendor);
    }
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    res.status(500).json({ message: 'Server error while fetching vendor profile' });
  }
};

// Get all vendors (with optional filters)
const getAllVendors = async (req, res) => {
  try {
    const { cuisine, pincode, status, rating, sortBy } = req.query;
    let filter = {};
    
    // Apply filters
    if (cuisine) {
      filter.cuisineType = new RegExp(cuisine, 'i');
    }
    if (pincode) {
      filter.pincode = pincode;
    }
    if (status) {
      filter.status = status;
    }
    // Note: Rating filter is not directly supported in the database schema
    // We'll filter by rating after fetching the data
    
    // Get vendors
    const vendors = await Vendor.find(filter)
      .populate('user', 'username email')
      .limit(50); // Limit to 50 vendors for performance
    
    // Get all vendor IDs for efficient menu item lookup
    const vendorIds = vendors.map(vendor => vendor._id);
    
    // Get all menu items for these vendors in one query
    const menuItems = await MenuItem.find({ vendor: { $in: vendorIds } });
    
    // Group menu items by vendor ID
    const menuItemsByVendor = {};
    menuItems.forEach(item => {
      if (!menuItemsByVendor[item.vendor]) {
        menuItemsByVendor[item.vendor] = [];
      }
      menuItemsByVendor[item.vendor].push(item);
    });
    
    // Calculate average menu prices for each vendor
    const averagePricesByVendor = {};
    Object.keys(menuItemsByVendor).forEach(vendorId => {
      const items = menuItemsByVendor[vendorId];
      const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
      averagePricesByVendor[vendorId] = items.length > 0 ? totalPrice / items.length : 0;
    });
    
    // Populate virtual fields and add officename for each vendor
    let vendorsWithData = await Promise.all(vendors.map(async (vendor) => {
      // Convert to plain object
      const vendorObject = vendor.toObject();
      
      // Add average menu price
      vendorObject._averageMenuPrice = averagePricesByVendor[vendor._id] || 0;
      
      // Add officename to the vendor
      const pincodeRecord = await PincodeLocation.findOne({ pincode: vendor.pincode });
      if (pincodeRecord && pincodeRecord.officename) {
        vendorObject.officename = pincodeRecord.officename;
      }
      
      return vendorObject;
    }));
    
    // Apply rating filter if provided
    if (rating) {
      const minRating = parseFloat(rating);
      if (!isNaN(minRating)) {
        vendorsWithData = vendorsWithData.filter(vendor => 
          vendor.ratings && vendor.ratings.average >= minRating
        );
      }
    }
    
    // Sort vendors based on the sort criteria
    vendorsWithData.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.ratings?.average || 0) - (a.ratings?.average || 0);
        case 'followers':
          return (b.ratings?.count || 0) - (a.ratings?.count || 0);
        case 'price_high':
          return (b._averageMenuPrice || 0) - (a._averageMenuPrice || 0); // High to low
        case 'price_low':
          return (a._averageMenuPrice || 0) - (b._averageMenuPrice || 0); // Low to high
        default:
          return a.businessName.localeCompare(b.businessName);
      }
    });
    
    res.json(vendorsWithData);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error while fetching vendors' });
  }
};

// Helper function to find pincode based on coordinates
const findPincodeByCoordinates = async (latitude, longitude) => {
  try {
    // Find the nearest pincode record within a reasonable distance
    const nearestPincodeRecord = await PincodeLocation.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000 // 5km radius, adjust as needed
        }
      }
    });
    
    if (nearestPincodeRecord) {
      console.log(`Found pincode: ${nearestPincodeRecord.pincode} for coordinates (${latitude}, ${longitude})`);
      return {
        pincode: nearestPincodeRecord.pincode,
        officename: nearestPincodeRecord.officename
      };
    } else {
      console.log(`No pincode found for coordinates (${latitude}, ${longitude})`);
      return null;
    }
  } catch (error) {
    console.error('Error finding pincode by coordinates:', error);
    return null;
  }
};

// Update vendor location
const updateVendorLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;
    
    // Validate required fields
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Verify user is a vendor
    // Use role from token if available, otherwise use role from database
    const userRole = req.user.roleFromToken || req.user.role;
    if (userRole !== 'vendor') {
      return res.status(403).json({ message: 'Only vendors can update location' });
    }
    
    // Verify vendor exists
    // First, try to get vendor profile (might already be populated)
    let vendor = req.user.vendorProfile;
    
    // If vendor profile doesn't exist or isn't populated, try to find one
    if (!vendor || typeof vendor === 'string' || !vendor.location) {
      vendor = await Vendor.findOne({ user: req.user.id });
    }
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found. Please create a vendor profile first.' });
    }
    
    // Update vendor location
    vendor.location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      accuracy: accuracy || null
    };
    
    // Try to find pincode based on coordinates
    const pincodeInfo = await findPincodeByCoordinates(latitude, longitude);
    let updatedVendor = vendor;
    if (pincodeInfo && pincodeInfo.pincode !== vendor.pincode) {
      // Update pincode if it's different
      vendor.pincode = pincodeInfo.pincode;
      updatedVendor = await vendor.save();
      
      // Add officename to the response if found
      if (pincodeInfo.officename) {
        updatedVendor = updatedVendor.toObject();
        updatedVendor.officename = pincodeInfo.officename;
      }
    } else {
      updatedVendor = await vendor.save();
    }
    
    res.json(updatedVendor);
  } catch (error) {
    console.error('Error updating vendor location:', error);
    res.status(500).json({ message: 'Server error while updating vendor location' });
  }
};

// Add menu item
const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable, imageUrl } = req.body;
    
    // Validate required fields
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    // Verify vendor exists
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      // If vendor profile doesn't exist, create one
      const user = await User.findById(req.user.id);
      // Use role from token if available, otherwise use role from database
      const userRole = req.user.roleFromToken || (user ? user.role : null);
      if (!user || userRole !== 'vendor') {
        return res.status(400).json({ message: 'User is not a vendor' });
      }
      
      // Create a basic vendor profile
      const newVendor = new Vendor({
        user: req.user.id,
        businessName: `${user.username}'s Business`,
        cuisineType: 'Street Food',
        phoneNumber: user.phoneNumber,
        pincode: user.pincode
      });
      
      const savedVendor = await newVendor.save();
      
      // Update user with vendor profile reference
      await User.findByIdAndUpdate(req.user.id, { 
        vendorProfile: savedVendor._id 
      });
      
      // Use the newly created vendor
      vendor = savedVendor;
    }
    
    // Create menu item
    const menuItem = new MenuItem({
      vendor: vendor._id,
      name,
      description,
      price,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      imageUrl
    });
    
    const savedMenuItem = await menuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ message: 'Server error while adding menu item' });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { name, description, price, category, isAvailable, imageUrl } = req.body;
    
    // Verify vendor owns this menu item
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    const menuItem = await MenuItem.findOneAndUpdate(
      { _id: menuItemId, vendor: vendor._id },
      { name, description, price, category, isAvailable, imageUrl },
      { new: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found or not owned by vendor' });
    }
    
    res.json(menuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Server error while updating menu item' });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    
    // Verify vendor owns this menu item
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    const menuItem = await MenuItem.findOneAndDelete({
      _id: menuItemId,
      vendor: vendor._id
    });
    
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found or not owned by vendor' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Server error while deleting menu item' });
  }
};

// Get menu items for a vendor
const getMenuItems = async (req, res) => {
  try {
    // Check if vendorId is provided in params (public route)
    if (req.params.vendorId) {
      // Public route - get menu items for specific vendor
      const menuItems = await MenuItem.find({ vendor: req.params.vendorId });
      return res.json(menuItems);
    }
    
    // Protected route - get menu items for current user's vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    const menuItems = await MenuItem.find({ vendor: vendor._id });
    res.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Server error while fetching menu items' });
  }
};

// Send broadcast message
const sendBroadcastMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Verify vendor exists
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // Get vendor's follower count (mock for now)
    const followerCount = vendor.followers ? vendor.followers.length : 120;
    
    // Create broadcast message
    const broadcastMessage = new BroadcastMessage({
      vendor: vendor._id,
      content,
      recipients: followerCount
    });
    
    const savedMessage = await broadcastMessage.save();
    
    // In a real app, you would send the message to followers here
    // For now, we'll just save it to the database
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending broadcast message:', error);
    res.status(500).json({ message: 'Server error while sending broadcast message' });
  }
};

// Get broadcast messages for a vendor
const getBroadcastMessages = async (req, res) => {
  try {
    // Check if vendorId is provided in params (public route)
    if (req.params.vendorId) {
      // Public route - get broadcast messages for specific vendor
      const messages = await BroadcastMessage.find({ vendor: req.params.vendorId })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to 50 messages
      
      // Populate vendor information for each message
      await BroadcastMessage.populate(messages, { path: 'vendor', select: 'businessName cuisineType' });
      
      return res.json(messages);
    }
    
    // Protected route - get broadcast messages for current user's vendor
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // Get broadcast messages for this vendor, sorted by most recent first
    const messages = await BroadcastMessage.find({ vendor: vendor._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 messages
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching broadcast messages:', error);
    res.status(500).json({ message: 'Server error while fetching broadcast messages' });
  }
};

// Delete broadcast message
const deleteBroadcastMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Verify vendor exists
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // Delete broadcast message if it belongs to this vendor
    const message = await BroadcastMessage.findOneAndDelete({
      _id: messageId,
      vendor: vendor._id
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Broadcast message not found or not owned by vendor' });
    }
    
    res.json({ message: 'Broadcast message deleted successfully' });
  } catch (error) {
    console.error('Error deleting broadcast message:', error);
    res.status(500).json({ message: 'Server error while deleting broadcast message' });
  }
};

// Follow a vendor
const followVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;

    // Check if the follow relationship already exists
    const existingFollow = await Follow.findOne({ customer: userId, vendor: vendorId });
    if (existingFollow) {
      return res.status(400).json({ message: 'You are already following this vendor' });
    }

    // Create a new follow relationship
    const follow = new Follow({
      customer: userId,
      vendor: vendorId
    });

    const savedFollow = await follow.save();
    
    res.status(201).json({ 
      message: 'Successfully followed vendor', 
      follow: savedFollow 
    });
  } catch (error) {
    console.error('Error following vendor:', error);
    res.status(500).json({ message: 'Server error while following vendor' });
  }
};

// Unfollow a vendor
const unfollowVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;

    // Find and delete the follow relationship
    const result = await Follow.findOneAndDelete({ customer: userId, vendor: vendorId });
    
    if (!result) {
      return res.status(400).json({ message: 'You are not following this vendor' });
    }

    res.json({ message: 'Successfully unfollowed vendor' });
  } catch (error) {
    console.error('Error unfollowing vendor:', error);
    res.status(500).json({ message: 'Server error while unfollowing vendor' });
  }
};

// Check if user is following a vendor
const isFollowingVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;

    // Check if the follow relationship exists
    const follow = await Follow.findOne({ customer: userId, vendor: vendorId });

    res.json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Server error while checking follow status' });
  }
};

// Get followed vendors for a customer
const getFollowedVendors = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all follow relationships for this customer
    const follows = await Follow.find({ customer: userId })
      .populate({
        path: 'vendor',
        select: 'businessName cuisineType pincode status ratings location images',
        populate: {
          path: 'user',
          select: 'username email'
        }
      });

    // Extract just the vendor information
    const vendors = follows.map(follow => follow.vendor);

    res.json(vendors);
  } catch (error) {
    console.error('Error fetching followed vendors:', error);
    res.status(500).json({ message: 'Server error while fetching followed vendors' });
  }
};

// Get vendor follower count
const getVendorFollowerCount = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Count the number of follows for this vendor
    const followerCount = await Follow.countDocuments({ vendor: vendorId });
    
    res.json({ followerCount });
  } catch (error) {
    console.error('Error fetching follower count:', error);
    res.status(500).json({ message: 'Server error while fetching follower count' });
  }
};

// Rate a vendor
const rateVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if the rating already exists
    let existingRating = await Rating.findOne({ customer: userId, vendor: vendorId });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      if (review !== undefined) {
        existingRating.review = review;
      }
      await existingRating.save();
    } else {
      // Create new rating
      existingRating = new Rating({
        customer: userId,
        vendor: vendorId,
        rating,
        review
      });
      await existingRating.save();
    }

    // Recalculate vendor's average rating
    const ratings = await Rating.find({ vendor: vendorId });
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings) : 0;

    // Update vendor's rating stats
    await Vendor.findByIdAndUpdate(vendorId, {
      'ratings.average': parseFloat(averageRating.toFixed(1)),
      'ratings.count': totalRatings
    });

    res.status(200).json({
      message: 'Rating submitted successfully',
      rating: existingRating,
      vendorStats: {
        average: parseFloat(averageRating.toFixed(1)),
        count: totalRatings
      }
    });
  } catch (error) {
    console.error('Error rating vendor:', error);
    res.status(500).json({ message: 'Server error while rating vendor' });
  }
};

// Get vendor rating by customer
const getVendorRatingByCustomer = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const userId = req.user.id;

    const rating = await Rating.findOne({ customer: userId, vendor: vendorId });

    res.json({ rating: rating || null });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ message: 'Server error while fetching rating' });
  }
};

// Get all ratings for a vendor
const getVendorRatings = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const ratings = await Rating.find({ vendor: vendorId })
      .populate('customer', 'username email')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
};

// Search menu items across all vendors
const searchMenuItems = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search for menu items that match the query (case insensitive)
    const menuItems = await MenuItem.find({
      name: { $regex: query, $options: 'i' }
    })
    .populate({
      path: 'vendor',
      select: 'businessName'
    })
    .limit(50); // Limit to 50 results
    
    // Format the results to include vendor information
    const results = menuItems.map(item => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      isAvailable: item.isAvailable,
      vendor: {
        _id: item.vendor._id,
        businessName: item.vendor.businessName
      }
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Error searching menu items:', error);
    res.status(500).json({ message: 'Server error while searching menu items' });
  }
};

// Search vendors by business name
const searchVendors = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search for vendors whose business name matches the query (case insensitive)
    const vendors = await Vendor.find({
      businessName: { $regex: query, $options: 'i' }
    })
    .populate('user', 'username email')
    .limit(50); // Limit to 50 results
    
    res.json(vendors);
  } catch (error) {
    console.error('Error searching vendors:', error);
    res.status(500).json({ message: 'Server error while searching vendors' });
  }
};

module.exports = {
  createVendorProfile,
  updateVendorProfile,
  getVendorProfile,
  getAllVendors,
  addMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  sendBroadcastMessage,
  getBroadcastMessages,
  deleteBroadcastMessage,
  updateVendorLocation,
  followVendor,
  unfollowVendor,
  isFollowingVendor,
  getFollowedVendors,
  getVendorFollowerCount,
  rateVendor,
  getVendorRatingByCustomer,
  getVendorRatings,
  searchMenuItems,
  searchVendors
};