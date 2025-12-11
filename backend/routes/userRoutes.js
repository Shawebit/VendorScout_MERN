const express = require('express');
const { getUserProfile, updateUserPincode } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes in this file require authentication
router.use(protect);

// Get user profile
router.get('/profile', getUserProfile);

// Update user pincode
router.put('/pincode', updateUserPincode);

module.exports = router;