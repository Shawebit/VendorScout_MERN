const Comment = require('../models/Comment');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { content, pincode, vendor, vendorProfile } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only customers can post comments
    // Use role from token if available, otherwise use role from database
    const userRole = req.user.roleFromToken || user.role;
    if (userRole !== 'customer') {
      return res.status(403).json({ message: 'Only customers can post comments' });
    }
    
    let finalPincode = pincode;
    
    // If vendorProfile is provided, get pincode from vendor
    if (vendorProfile) {
      const vendor = await Vendor.findById(vendorProfile);
      if (vendor) {
        finalPincode = vendor.pincode;
      }
    }
    
    // Validate pincode is provided
    if (!finalPincode) {
      return res.status(400).json({ message: 'Pincode is required' });
    }
    
    // Validate pincode format
    if (!/^\d{6}$/.test(finalPincode)) {
      return res.status(400).json({ message: 'Pincode must be a 6-digit number' });
    }
    
    // Create comment
    const comment = new Comment({
      content,
      author: req.user.id, // Store the user ID directly
      authorName: user.username || user.email,
      pincode: finalPincode,
      vendor: vendor || '', // Vendor is optional
      vendorProfile: vendorProfile || null, // Specific vendor profile reference
      likedBy: [] // Initialize likedBy array
    });
    
    const savedComment = await comment.save();
    
    // Populate author field for response
    await savedComment.populate('author', 'username email');
    
    res.status(201).json(savedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Server error while creating comment' });
  }
};

// Get all comments
const getComments = async (req, res) => {
  try {
    const { sortBy = 'recent', pincode } = req.query;
    
    // Build sort criteria
    let sortCriteria = {};
    if (sortBy === 'likes') {
      sortCriteria = { likes: -1 };
    } else {
      sortCriteria = { createdAt: -1 }; // Most recent first
    }
    
    // Build filter criteria
    let filter = {
      // Only fetch comments that are NOT directed to specific vendors
      vendorProfile: { $exists: false }
    };
    
    // If pincode is provided, add it to the filter
    if (pincode) {
      filter.pincode = pincode;
    } else {
      // If no pincode is provided, exclude comments with vendorProfile
      filter.vendorProfile = null;
    }
    
    // Get comments with populated author details
    const comments = await Comment.find(filter)
      .populate('author', 'username email')
      .sort(sortCriteria)
      .limit(100); // Limit to 100 comments
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// Get comments by pincode (for vendors to view customer discussions in their area)
const getCommentsByPincode = async (req, res) => {
  try {
    // Verify user is a vendor
    // Use role from token if available, otherwise use role from database
    const userRole = req.user.roleFromToken || req.user.role;
    
    if (userRole !== 'vendor') {
      return res.status(403).json({ 
        message: 'Access denied. Only vendors can view this content.'
      });
    }
    
    // Get the vendor's pincode
    // First, try to get vendor profile (might already be populated)
    let vendor = req.user.vendorProfile;
    
    // If vendor profile doesn't exist or isn't populated, try to find/create one
    if (!vendor || typeof vendor === 'string' || !vendor.pincode) {
      vendor = await Vendor.findOne({ user: req.user.id });
    }
    
    // If vendor profile still doesn't exist, try to create one
    if (!vendor) {
      // Get user details
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'vendor') {
        return res.status(403).json({ message: 'Access denied. Only vendors can view this content.' });
      }
      
      // Create a basic vendor profile
      const newVendor = new Vendor({
        user: user._id,
        businessName: `${user.username}'s Business`,
        cuisineType: 'Street Food',
        phoneNumber: user.phoneNumber,
        pincode: user.pincode
      });
      
      vendor = await newVendor.save();
      
      // Update user with vendor profile reference
      user.vendorProfile = vendor._id;
      await user.save();
      
      // Update req.user with the vendor profile reference
      if (req.user) {
        req.user.vendorProfile = vendor._id;
      }
    }
    
    // Get comments with the same pincode as the vendor, excluding vendor-specific comments
    const comments = await Comment.find({ 
      pincode: vendor.pincode,
      $or: [
        { vendorProfile: { $exists: false } },
        { vendorProfile: null }
      ]
    })
      .populate('author', 'username email')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to 50 comments
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments by pincode:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// Get comments for a specific vendor
const getCommentsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Get comments for the specific vendor
    const comments = await Comment.find({ vendorProfile: vendorId })
      .populate('author', 'username email')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(100); // Limit to 100 comments
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments by vendor:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// Delete a comment (only by the author)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        message: 'Comment not found' 
      });
    }
    
    // Check if the current user is the author of the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'User not authorized to delete this comment' 
      });
    }
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

// Like a comment (one like per user, silently ignore duplicates)
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    
    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user has already liked this comment
    const alreadyLiked = comment.likedBy.some(id => id.toString() === userId.toString());
    
    if (alreadyLiked) {
      // Unlike the comment
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
      comment.likes = Math.max(0, comment.likes - 1); // Ensure likes don't go below 0
    } else {
      // Like the comment
      comment.likedBy.push(userId);
      comment.likes += 1;
    }
    
    await comment.save();
    
    // Return only the necessary data for frontend update
    res.json({ 
      _id: comment._id,
      likes: comment.likes,
      likedBy: comment.likedBy
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Server error while liking comment' });
  }
};

// Get all comments for a vendor and summarize them
const getVendorCommentsSummary = async (req, res) => {
  try {
    // Get the vendor profile for the current user
    const vendor = await Vendor.findOne({ user: req.user.id });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }
    
    // Get all comments for this vendor
    const comments = await Comment.find({ vendorProfile: vendor._id })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    
    // Extract comment texts for summarization
    const commentTexts = comments.map(comment => comment.content);
    
    res.json({
      comments: commentTexts,
      count: commentTexts.length,
      vendor: {
        _id: vendor._id,
        businessName: vendor.businessName,
        pincode: vendor.pincode
      }
    });
  } catch (error) {
    console.error('Error fetching vendor comments:', error);
    res.status(500).json({ message: 'Server error while fetching vendor comments' });
  }
};

module.exports = {
  createComment,
  getComments,
  getCommentsByPincode,
  getCommentsByVendor,
  deleteComment,
  likeComment,
  getVendorCommentsSummary
};