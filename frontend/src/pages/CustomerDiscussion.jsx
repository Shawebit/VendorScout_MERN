import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { commentAPI, userAPI } from '../services/api';
import CustomerFooter from '../components/CustomerFooter';
import ConfirmationModal from '../components/ConfirmationModal';
import './CustomerDashboardStyles.css';

const CustomerDiscussion = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [vendor, setVendor] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  // Fetch comments when component mounts or sortBy changes
  useEffect(() => {
    fetchComments();
  }, [sortBy]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getComments({ sortBy });
      setComments(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError('Comment content is required');
      return;
    }
    
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      setError('Valid 6-digit pincode is required');
      return;
    }
    
    try {
      const commentData = {
        content: newComment,
        pincode: pincode,
        vendor: vendor || '' // Vendor is optional
      };
      
      const response = await commentAPI.createComment(commentData);
      
      // Add new comment to the top of the list
      setComments(prevComments => [response.data, ...prevComments]);
      setNewComment('');
      setVendor('');
      setError('');
    } catch (err) {
      console.error('Error posting comment:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to post comment. Please try again.');
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Set the comment to delete and show the modal
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await commentAPI.deleteComment(commentToDelete);
      // Remove deleted comment from state
      setComments(prevComments => prevComments.filter(comment => comment._id !== commentToDelete));
      setError('');
    } catch (err) {
      console.error('Error deleting comment:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to delete comment. Please try again.');
      }
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await commentAPI.likeComment(commentId);
      // Update the liked comment in state with the new likes count and likedBy array
      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId 
            ? { ...comment, likes: response.data.likes, likedBy: response.data.likedBy }
            : comment
        )
      );
      // Don't show error for duplicate likes - silently ignore
      setError('');
    } catch (err) {
      console.error('Error liking comment:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to like comment. Please try again.');
      }
    }
  };

  // Handle pincode search in navbar
  const handlePincodeSearch = async () => {
    if (!pincodeInput.trim()) {
      alert('Please enter a pincode');
      return;
    }
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincodeInput)) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    
    try {
      // Save the pincode to the database
      await userAPI.updatePincode(pincodeInput);
      
      // Set the customer pincode
      setPincode(pincodeInput);
      // Also update the pincode in the comment form
      setPincodeInput(pincodeInput);
    } catch (err) {
      console.error('Error updating pincode:', err);
      alert('Failed to update pincode. Please try again.');
    }
  };

  // Check if the current user has liked a comment
  const hasLikedComment = (comment) => {
    if (!user || !comment.likedBy) return false;
    
    // Convert user ID to string for comparison
    const userId = user.id.toString();
    
    // Check if any item in likedBy matches the user ID
    return comment.likedBy.some(likedUserId => 
      likedUserId.toString() === userId
    );
  };

  // Check if the current user is the author of a comment
  const isCommentAuthor = (comment) => {
    // Handle different possible formats for the author field
    if (!user || !comment.author) return false;
    
    // If author is an object with _id property
    if (typeof comment.author === 'object' && comment.author._id) {
      return user.id === comment.author._id;
    }
    
    // If author is a string (ObjectId)
    if (typeof comment.author === 'string') {
      return user.id === comment.author;
    }
    
    return false;
  };

  // Sort comments based on selected option
  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') {
      return b.likes - a.likes;
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt); // Recent first
    }
  });

  return (
    <div className="customer-dashboard">
      {/* Navigation Bar - FIXED NAVBAR STYLING */}
      <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 onClick={() => navigate('/customer/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
            
            {/* Pincode input in navbar - moved to left side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter pincode"
                className="form-input-smooth"
              />
              <button 
                onClick={handlePincodeSearch} 
                className="btn-smooth"
              >
                {/* Location pin icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/customer/map')} className="btn-smooth secondary">
              Live Map
            </button>
            <button onClick={() => navigate('/customer/discussion')} className="btn-smooth secondary">
              Community Discussions
            </button>
            <button onClick={() => navigate('/customer/followed')} className="btn-smooth secondary">
              Followed Vendors
            </button>
            <button onClick={handleLogout} className="btn-smooth secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main container - REMOVED FULL SCREEN CLASS FOR CONSISTENCY */}
      <div className="customer-dashboard-container">
        {/* Header */}
        <header className="dashboard-card">
          <div className="discussion-header-content">
            <h2 className="section-title">Community Discussion</h2>
            <p className="discussion-subtitle">Share your experiences and discover new favorites</p>
          </div>
        </header>
        
        {/* Error Message */}
        {error && (
          <section className="dashboard-card error-message">
            <div className="error-content">
              <div className="error-icon">
                <svg className="error-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="error-text">
                  Failed to load
                </p>
              </div>
            </div>
          </section>
        )}
        
        {/* Post New Comment */}
        <section className="dashboard-card">
          <div>
            <h3 className="discussion-section-title">Share Your Experience</h3>
            
            {/* Pincode Field (Required) */}
            <div className="form-group">
              <label className="form-label">
                Pincode *
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit pincode"
                maxLength="6"
                className="form-input-smooth"
              />
            </div>
            
            {/* Vendor Field (Optional) */}
            <div className="form-group">
              <label className="form-label">
                Vendor (optional)
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Vendor name"
                className="form-input-smooth"
              />
            </div>
            
            {/* Comment Content */}
            <div className="form-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Tell the community about your favorite street food finds, recommendations, or experiences..."
                className="form-input-smooth"
              />
            </div>
            <div className="comment-actions">
              <span className="character-count">
                {newComment.length}/280
              </span>
              <button onClick={handleAddComment} className="btn-smooth">
                Post Comment
              </button>
            </div>
          </div>
        </section>
        
        {/* Sort Options */}
        <section className="dashboard-card">
          <div>
            <div className="sort-options">
              <h3 className="discussion-section-title">Community Posts</h3>
              <div className="sort-controls">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  disabled={loading}
                  className="form-input-smooth"
                >
                  <option value="recent">Most Recent</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>
            </div>
          </div>
        </section>
        
        {/* Loading Indicator */}
        {loading && (
          <section className="dashboard-card empty-state-smooth">
            <div>
              <div></div>
              <p>Loading comments...</p>
            </div>
          </section>
        )}
        
        {/* Comments List */}
        {!loading && (
          <section className="dashboard-card" style={{ flex: 1 }}>
            <div style={{ height: '100%' }}>
              {sortedComments.length === 0 ? (
                <div className="empty-state-smooth">
                  <div></div>
                  <h4 className="no-comments-title">No comments yet</h4>
                  <p>Be the first to share your street food experience!</p>
                </div>
              ) : (
                <div className="comments-list">
                  {sortedComments.map((comment) => (
                    <div key={comment._id} className="comment-card">
                      <div className="comment-header">
                        <div>
                          <div className="comment-author-info">
                            <span className="comment-author-name">{comment.author?.name || 'Anonymous'}</span>
                            <span className="comment-timestamp">
                              {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="comment-location">
                            {comment.pincode} {comment.vendor && `• ${comment.vendor}`}
                          </p>
                        </div>
                        <div className="comment-actions">
                          {isCommentAuthor(comment) && (
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              title="Delete comment"
                              className="btn-delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                              </svg>
                            </button>
                          )}
                          <button 
                            onClick={() => handleLike(comment._id)}
                            className={`btn-like ${hasLikedComment(comment) ? 'liked' : ''}`}
                          >
                            {/* Heart icon for like */}
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="16" 
                              height="16" 
                              fill={hasLikedComment(comment) ? "currentColor" : "none"} 
                              viewBox="0 0 16 16"
                              stroke="currentColor"
                            >
                              <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                            </svg>
                            <span className="like-count">{comment.likes}</span>
                          </button>
                        </div>
                      </div>
                      <p className="comment-content">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmButtonStyle="danger"
      />
      
      <CustomerFooter />
    </div>
  );
};

export default CustomerDiscussion;