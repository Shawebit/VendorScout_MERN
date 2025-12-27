import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { commentAPI, userAPI } from '../../services/api';
import CustomerFooter from '../../components/CustomerFooter';
import ConfirmationModal from '../../components/ConfirmationModal';
import './css/FollowedVendorsStyles.css';

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
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

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
      setError('Failed to load comments');
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
      const response = await commentAPI.createComment({
        content: newComment,
        pincode: pincode,
        vendor: vendor || ''
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setVendor('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      await commentAPI.deleteComment(commentToDelete);
      setComments(prev => prev.filter(c => c._id !== commentToDelete));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleLike = async (commentId) => {
    try {
      const response = await commentAPI.likeComment(commentId);
      setComments(prev => 
        prev.map(c => 
          c._id === commentId 
            ? { ...c, likes: response.data.likes, likedBy: response.data.likedBy }
            : c
        )
      );
      setError('');
    } catch (err) {
      if (err.response?.status !== 400) {
        setError(err.response?.data?.message || 'Failed to like comment');
      }
    }
  };

  const handlePincodeSearch = async () => {
    if (!pincodeInput.trim() || !/^\d{6}$/.test(pincodeInput)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    
    try {
      await userAPI.updatePincode(pincodeInput);
      setPincode(pincodeInput);
      setError('');
    } catch (err) {
      setError('Failed to update pincode');
    }
  };

  const hasLikedComment = (comment) => {
    if (!user || !comment.likedBy) return false;
    return comment.likedBy.some(id => id.toString() === user.id.toString());
  };

  const isCommentAuthor = (comment) => {
    if (!user || !comment.author) return false;
    
    if (typeof comment.author === 'object' && comment.author._id) {
      return user.id === comment.author._id;
    }
    
    return user.id === comment.author;
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') {
      return b.likes - a.likes;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="customer-dashboard">
      {/* Navbar */}
      <nav className="customer-navbar">
        <div className="customer-navbar-container">
          <div className="navbar-left">
            <div className="pincode-search-container">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter pincode"
                maxLength="6"
                className="pincode-input"
              />
              <button onClick={handlePincodeSearch} className="pincode-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="navbar-center">
            <h1 className="navbar-logo" onClick={() => navigate('/customer/dashboard')}>
              VendorScout
            </h1>
          </div>
          
          <div className="navbar-right">
            <button onClick={() => navigate('/customer/map')} className="nav-link">
              Live Map
            </button>
            <button onClick={() => navigate('/customer/discussion')} className="nav-link active">
              Community
            </button>
            <button onClick={() => navigate('/customer/followed')} className="nav-link">
              Followed
            </button>
            <button onClick={handleLogout} className="nav-link logout-link">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="customer-dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h2 className="dashboard-title">Community Discussion</h2>
          <p className="dashboard-subtitle">Share experiences and discover vendors</p>
        </header>

        {/* Error Banner */}
        {error && (
          <section className="error-banner">
            <div className="error-content">
              <span className="error-text">{error}</span>
            </div>
          </section>
        )}

        {/* Post Form */}
        <section className="vendors-grid-section" style={{ paddingTop: '1rem', paddingBottom: '4rem', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000000', marginBottom: '3rem', textAlign: 'center' }}>Post a Comment</h3>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAddComment(); }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                    className="pincode-input"
                    style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}
                  />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vendor (Optional)</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    placeholder="Vendor name"
                    className="pincode-input"
                    style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Experience</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience..."
                  maxLength="280"
                  style={{ 
                    width: '100%', 
                    minHeight: '120px', 
                    padding: '1rem', 
                    border: '1px solid #000000',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid #f5f5f5' }}>
                <span style={{ fontSize: '0.75rem', color: '#666666' }}>{newComment.length}/280</span>
                <button type="submit" className="nav-link logout-link" disabled={loading} style={{ padding: '1rem 2.5rem', letterSpacing: '0.15em' }}>
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Comments List */}
        <section className="vendors-grid-section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e5e5' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#000000', margin: 0 }}>Community Posts</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={loading}
                className="pincode-input"
                style={{ padding: '0.75rem 2.5rem 0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', width: 'auto' }}
              >
                <option value="recent">Most Recent</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#666666' }}>Loading comments...</p>
              </div>
            ) : sortedComments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>No Posts Yet</h4>
                <p style={{ fontSize: '0.875rem', color: '#666666' }}>Be the first to share</p>
              </div>
            ) : (
              <div className="vendors-grid">
              {sortedComments.map((comment) => (
                <div key={comment._id} className="vendor-card" style={{ cursor: 'default' }}>
                  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid #f5f5f5' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                          {comment.author?.name || 'Anonymous'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666666', marginBottom: '0.25rem' }}>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                          {comment.pincode}{comment.vendor && ` • ${comment.vendor}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isCommentAuthor(comment) && (
                          <button 
                            onClick={() => handleDeleteComment(comment._id)}
                            className="pincode-btn"
                            style={{ padding: '0.5rem', width: '32px', height: '32px' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        )}
                        <button 
                          onClick={() => handleLike(comment._id)}
                          className={hasLikedComment(comment) ? 'nav-link logout-link' : 'nav-link'}
                          style={{ padding: '0.5rem 0.875rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', height: '32px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill={hasLikedComment(comment) ? "currentColor" : "none"} viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                            <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
                          </svg>
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}            </div>
          )}
          </div>
        </section>
      </div>
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCommentToDelete(null);
        }}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        confirmButtonStyle="danger"
      />
      
      <CustomerFooter />
    </div>
  );
};

export default CustomerDiscussion;
