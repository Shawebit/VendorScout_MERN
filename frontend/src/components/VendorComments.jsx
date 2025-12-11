import React, { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

const VendorComments = ({ vendorId, currentUser, vendorPincode }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Check if current user is a customer (not a vendor)
  const isCustomer = currentUser && currentUser.role === 'customer';
  // Check if current user is a vendor
  const isVendor = currentUser && currentUser.role === 'vendor';

  // Fetch comments for this vendor
  useEffect(() => {
    if (vendorId) {
      fetchComments();
    }
  }, [vendorId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentAPI.getCommentsByVendor(vendorId);
      setComments(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isCustomer) return;

    try {
      const commentData = {
        content: newComment,
        pincode: vendorPincode || '123456', // Use provided pincode or fallback
        vendorProfile: vendorId
      };

      await commentAPI.createComment(commentData);
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError('Failed to post comment');
    }
  };

  const handleDelete = async (commentId) => {
    // Set the comment to delete and show the modal
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    try {
      await commentAPI.deleteComment(commentToDelete);
      fetchComments(); // Refresh comments
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
    } finally {
      setCommentToDelete(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '1rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Customer Reviews</h3>
      
      {error && (
        <div style={{ backgroundColor: '#f0f0f0', borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Comment Form - Only visible to customers */}
      {isCustomer && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this vendor..."
              rows="3"
              maxLength="280"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px', marginBottom: '0.5rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem' }}>
                {280 - newComment.length} characters remaining
              </span>
              <button
                type="submit"
                disabled={!newComment.trim()}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Post Comment
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ margin: '0 auto', width: '2rem', height: '2rem', border: '2px solid #000', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }}></div>
          <div>Loading comments...</div>
        </div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <p>
            {isCustomer 
              ? "No comments yet. Be the first to share your experience!" 
              : "No comments from customers yet."}
          </p>
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <div key={comment._id} style={{ borderBottom: '1px solid #000', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600' }}>{comment.author?.name || 'Anonymous'}</span>
                    <span style={{ fontSize: '0.875rem', color: '#000' }}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p style={{ fontStyle: 'italic' }}>{comment.content}</p>
                </div>
                
                {/* Delete button - only for comment author */}
                {currentUser && comment.author && comment.author._id === currentUser._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    aria-label="Delete comment"
                    style={{ padding: '0.25rem', backgroundColor: '#f0f0f0', color: '#000', border: '1px solid #000', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '1rem', height: '1rem' }}>
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmButtonStyle="danger"
      />
    </div>
  );
};

export default VendorComments;