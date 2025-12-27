import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, commentAPI } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import Footer from '../../components/Footer';
import './css/VendorDiscussionsStyles.css';
import '../../styles/globals.css';


const VendorDiscussions = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchComments();
  }, [sortBy]);

  const fetchComments = async (retryCount = 0) => {
    try {
      setLoading(true);
      // Get the vendor's pincode from the user context
      const vendorPincode = user?.pincode;
      if (!vendorPincode) {
        throw new Error('Vendor pincode not found');
      }
      
      const response = await commentAPI.getCommentsByVendorPincode();
      
      // Sort comments based on selected option
      let sortedComments = [...response.data];
      if (sortBy === 'likes') {
        sortedComments.sort((a, b) => b.likes - a.likes);
      } else {
        // Default sort by recent (newest first)
        sortedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      setComments(sortedComments);
      setError('');
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      
      // Retry logic for network errors (up to 2 retries)
      if (retryCount < 2 && (err.code === 'NETWORK_ERROR' || err.message.includes('timeout') || err.message.includes('Network Error'))) {
        setTimeout(() => {
          fetchComments(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // More specific error messages
      if (err.response?.status === 401) {
        setError('Authentication expired. Please log in again.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('timeout')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load customer discussions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const handleLike = async (commentId) => {
    try {
      const response = await commentAPI.toggleLike(commentId);
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: response.data.likes,
            likedBy: response.data.likedBy
          };
        }
        return comment;
      });
      setComments(updatedComments);
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        {/* Navigation Bar */}
        <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 onClick={() => navigate('/vendor/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => navigate('/vendor/profile')}
                className="btn-vendor secondary"
              >
                Profile
              </button>
              <button 
                onClick={() => navigate('/vendor/menu')}
                className="btn-vendor secondary"
              >
                Menu
              </button>
              <button 
                onClick={() => navigate('/vendor/location')}
                className="btn-vendor secondary"
              >
                Location
              </button>
              <button 
                onClick={() => navigate('/vendor/broadcast')}
                className="btn-vendor secondary"
              >
                Broadcast
              </button>
              <button 
                onClick={() => navigate('/vendor/discussions')}
                className="btn-vendor secondary"
              >
                Discussions
              </button>
              <button 
                onClick={handleLogout}
                className="btn-vendor"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <div className="vendor-dashboard-container">
          <div className="vendor-dashboard-card">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div style={{ width: '3rem', height: '3rem', border: '2px solid #000', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
              <div>Loading customer discussions...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      {/* Navigation Bar */}
      <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem', borderBottom: '1px solid #000000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 onClick={() => navigate('/vendor/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate('/vendor/profile')}
              className="btn-vendor secondary"
            >
              Profile
            </button>
            <button 
              onClick={() => navigate('/vendor/menu')}
              className="btn-vendor secondary"
            >
              Menu
            </button>
            <button 
              onClick={() => navigate('/vendor/location')}
              className="btn-vendor secondary"
            >
              Location
            </button>
            <button 
              onClick={() => navigate('/vendor/broadcast')}
              className="btn-vendor secondary"
            >
              Broadcast
            </button>
            <button 
              onClick={() => navigate('/vendor/discussions')}
              className="btn-vendor"
            >
              Discussions
            </button>
            <button 
              onClick={handleLogout}
              className="btn-vendor"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="vendor-dashboard-container">
        {/* Header */}
        <header className="vendor-dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <h1 className="vendor-section-title">Customer Discussions</h1>
            <p className="vendor-section-subtitle">Discussions from customers in your area</p>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="vendor-dashboard-card" style={{ borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flexShrink: 0 }}>
                <svg style={{ height: '1.25rem', width: '1.25rem', color: '#000' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#000' }}>
                  Failed to load
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Recent Customer Discussions</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={loading}
                className="form-input"
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <option value="recent">Most Recent</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>
          
          {comments.length === 0 ? (
            <div className="empty-state-vendor">
              <div></div>
              <h3 className="no-vendors-title">No customer discussions yet</h3>
              <p>There are no customer discussions in your pincode area.</p>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment._id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div>
                        <span style={{ fontWeight: '600', color: 'var(--color-black)' }}>{comment.author?.name || 'Anonymous'}</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--color-medium-grey)' }}>
                          {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-medium-grey)', marginTop: '0.25rem' }}>
                        {comment.pincode} {comment.vendor && `• ${comment.vendor}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleLike(comment._id)}
                      className="btn-vendor secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem' }}
                    >
                      <svg style={{ width: '1rem', height: '1rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                  <p style={{ marginTop: '0.5rem' }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VendorDiscussions;