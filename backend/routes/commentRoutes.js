const express = require('express');
const { 
  createComment,
  getComments,
  deleteComment,
  likeComment,
  getCommentsByPincode,
  getCommentsByVendor,
  getVendorCommentsSummary
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Comment routes (protected)
router.route('/')
  .post(protect, createComment)
  .get(protect, getComments);

// Get vendor comments summary (protected - vendor only)
// This needs to be placed before parameterized routes to avoid conflicts
router.route('/vendor-summary')
  .get(protect, getVendorCommentsSummary);

// Get comments by vendor's pincode (protected - vendor only)
router.route('/vendor-pincode')
  .get(protect, getCommentsByPincode);

// Get comments for a specific vendor (public)
router.route('/vendor/:vendorId')
  .get(getCommentsByVendor);

// Comment routes with ID (protected)
// These parameterized routes should come after specific routes
router.route('/:commentId')
  .delete(protect, deleteComment);

// Like comment route (protected)
router.route('/:commentId/like')
  .post(protect, likeComment);

module.exports = router;