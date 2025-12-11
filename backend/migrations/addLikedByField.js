// Migration script to add likedBy field to existing comments
// Run this script once after deploying the changes

const mongoose = require('mongoose');
const Comment = require('../models/Comment');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streetfoodtracker');

const addLikedByField = async () => {
  try {
    // Update all comments to have an empty likedBy array if it doesn't exist
    const result = await Comment.updateMany(
      { likedBy: { $exists: false } },
      { $set: { likedBy: [] } }
    );
    
    console.log(`Updated ${result.modifiedCount} comments with likedBy field`);
  } catch (error) {
    console.error('Error updating comments:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the migration
addLikedByField();