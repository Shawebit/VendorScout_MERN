const express = require('express');
const { 
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
} = require('../controllers/vendorController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Vendor profile routes (protected)
router.route('/profile')
  .post(protect, createVendorProfile)
  .get(protect, getVendorProfile)
  .put(protect, updateVendorProfile);

// Get vendor profile by ID (public)
router.route('/profile/:vendorId')
  .get(getVendorProfile);

// Search menu items across all vendors (public)
// This needs to be placed before routes with :vendorId to avoid conflicts
router.route('/search/menu')
  .get(searchMenuItems);

// Search vendors by business name (public)
router.route('/search/vendors')
  .get(searchVendors);

// Get all vendors (public with filters)
router.route('/')
  .get(getAllVendors);

// Vendor location routes (protected)
router.route('/location')
  .put(protect, updateVendorLocation);

// Follow/unfollow vendor routes (protected)
router.route('/follow/:vendorId')
  .post(protect, followVendor);

router.route('/unfollow/:vendorId')
  .post(protect, unfollowVendor);

router.route('/following/:vendorId')
  .get(protect, isFollowingVendor);

// Get followed vendors for customer (protected)
router.route('/followed')
  .get(protect, getFollowedVendors);

// Get vendor follower count (public)
router.route('/:vendorId/followers/count')
  .get(getVendorFollowerCount);

// Rate a vendor (protected - customer only)
router.route('/:vendorId/rate')
  .post(protect, rateVendor);

// Get vendor rating by customer (protected - customer only)
router.route('/:vendorId/rating')
  .get(protect, getVendorRatingByCustomer);

// Get all ratings for a vendor (public)
router.route('/:vendorId/ratings')
  .get(getVendorRatings);

// Menu item routes (protected)
router.route('/menu')
  .post(protect, addMenuItem)
  .get(protect, getMenuItems);

// Menu item routes with ID (protected)
router.route('/menu/:menuItemId')
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

// Get menu items for a specific vendor (public)
router.route('/:vendorId/menu')
  .get(getMenuItems);

// Broadcast message routes (protected)
router.route('/broadcast')
  .post(protect, sendBroadcastMessage)
  .get(protect, getBroadcastMessages);

// Get broadcast messages for a specific vendor (public)
router.route('/:vendorId/broadcast')
  .get(getBroadcastMessages);

// Broadcast message routes with ID (protected)
router.route('/broadcast/:messageId')
  .delete(protect, deleteBroadcastMessage);

module.exports = router;