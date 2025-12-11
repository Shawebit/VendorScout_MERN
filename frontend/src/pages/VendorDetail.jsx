// src/pages/VendorDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, commentAPI, userAPI } from '../services/api';
import './CustomerDashboardStyles.css';

const VendorDetail = () => {
  const { vendorId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorComments, setVendorComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [vendorMenuItems, setVendorMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [userRating, setUserRating] = useState(0);
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  useEffect(() => {
    fetchVendorDetails();
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getVendorById(vendorId);
      setVendor(response.data);
      
      // Check if user is following this vendor
      try {
        const followResponse = await vendorAPI.isFollowingVendor(vendorId);
        setFollowingStatus(followResponse.data.isFollowing);
      } catch (err) {
        console.error('Error checking follow status:', err);
        setFollowingStatus(false);
      }
      
      // Get user's rating for this vendor
      try {
        const ratingResponse = await vendorAPI.getVendorRatingByCustomer(vendorId);
        setUserRating(ratingResponse.data.rating || 0);
      } catch (err) {
        console.error('Error getting user rating:', err);
        setUserRating(0);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching vendor details:', err);
      setError('Failed to load vendor details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendor) {
      fetchVendorComments(vendor._id);
      fetchVendorMenu(vendor._id);
    }
  }, [vendor]);

  const fetchVendorComments = async (vendorId) => {
    try {
      setCommentsLoading(true);
      const response = await commentAPI.getCommentsByVendor(vendorId);
      setVendorComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setVendorComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchVendorMenu = async (vendorId) => {
    try {
      setMenuLoading(true);
      const response = await vendorAPI.getMenuItemsByVendor(vendorId);
      setVendorMenuItems(response.data);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setVendorMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleFollowVendor = async () => {
    try {
      if (followingStatus) {
        // Unfollow
        await vendorAPI.unfollowVendor(vendorId);
        setFollowingStatus(false);
      } else {
        // Follow
        await vendorAPI.followVendor(vendorId);
        setFollowingStatus(true);
      }
    } catch (err) {
      console.error('Error following/unfollowing vendor:', err);
      alert('Failed to update follow status. Please try again.');
    }
  };

  const handleRateVendor = async (ratingValue) => {
    try {
      await vendorAPI.rateVendor(vendorId, { rating: ratingValue });
      setUserRating(ratingValue);
    } catch (err) {
      console.error('Error rating vendor:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      alert('Please enter a comment before submitting.');
      return;
    }

    try {
      await commentAPI.createComment({
        content: commentText,
        vendorProfile: vendorId,
        pincode: vendor.pincode
      });
      setCommentText('');
      alert('Review submitted successfully!');
      fetchVendorComments(vendorId);
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit review. Please try again.');
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
      
      // Navigate to customer dashboard with the new pincode
      navigate('/customer/dashboard');
    } catch (err) {
      console.error('Error updating pincode:', err);
      alert('Failed to update pincode. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const groupMenuItemsByCategory = (menuItems) => {
    return menuItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="customer-dashboard">
        {/* Navigation Bar */}
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
        
        <div className="customer-dashboard-container">
          <div className="dashboard-card empty-state-smooth">
            <div>
              <div></div>
              <p>Loading vendor details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-dashboard">
        {/* Navigation Bar */}
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
        
        <div className="customer-dashboard-container">
          <div className="dashboard-card error-message">
            <div>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="customer-dashboard">
        {/* Navigation Bar */}
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
        
        <div className="customer-dashboard-container">
          <div className="dashboard-card empty-state-smooth">
            <div>
              <div></div>
              <p>Vendor not found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      {/* Navigation Bar */}
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
      
      <div className="customer-dashboard-container">
        {/* Back to Dashboard Button */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="btn-smooth secondary"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Vendor Detail Header */}
        <header className="dashboard-card">
          <div className="vendor-detail-header">
            <h2 className="section-title">{vendor.businessName}</h2>
            <button onClick={handleFollowVendor} className="btn-smooth">
              {followingStatus ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        </header>

        {/* Vendor Details */}
        <section className="dashboard-card">
          <div className="detail-section">
            {/* Vendor Image */}
            <div className="vendor-image-container">
              <img 
                src={vendor.images && vendor.images.length > 0 
                  ? vendor.images[0].url 
                  : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%23666'%3EVENDOR IMAGE%3C/text%3E%3C/svg%3E`}
                alt={vendor.businessName}
                className="vendor-detail-image"
              />
            </div>
            
            {/* Vendor Information - REMOVED BIGGER BOX CONTAINER */}
            <div className="detail-section">
              <h3 className="section-title">Vendor Information</h3>
              {/* Removed vendor-info-card container to reduce the bigger box */}
              <div className="vendor-info-row">
                <div className="vendor-info-item">
                  <span className="vendor-info-label">Name</span>
                  <span className="vendor-info-value">{vendor.businessName}</span>
                </div>
                <div className="vendor-info-item">
                  <span className="vendor-info-label">Cuisine Type</span>
                  <span className="vendor-info-value">{vendor.cuisineType}</span>
                </div>
              </div>
              <div className="vendor-info-row">
                <div className="vendor-info-item">
                  <span className="vendor-info-label">Status</span>
                  <span className={vendor.status === 'open' ? 'vendor-status-open' : 'vendor-status-closed'}>
                    {vendor.status.toUpperCase()}
                  </span>
                </div>
                <div className="vendor-info-item">
                  <span className="vendor-info-label">Pincode</span>
                  <span className="vendor-info-value">{vendor.pincode}</span>
                </div>
              </div>
            </div>
            
            {/* Menu Section */}
            <div className="detail-section">
              <h3 className="section-title">Menu</h3>
              {menuLoading ? (
                <div className="empty-state-smooth">
                  <p>Loading menu...</p>
                </div>
              ) : vendorMenuItems.length === 0 ? (
                <div className="empty-state-smooth">
                  <p>No menu items available.</p>
                </div>
              ) : (
                <div className="menu-items-horizontal">
                  {vendorMenuItems.map((item) => (
                    <div key={item._id} className="menu-item-card-horizontal">
                      <span className={item.isAvailable ? 'availability-corner-text available' : 'availability-corner-text not-available'}>
                        {item.isAvailable ? 'AVAILABLE' : 'NOT AVAILABLE'}
                      </span>
                      <div className="menu-item-content-horizontal">
                        <div className="menu-item-image-container-horizontal">
                          <img 
                            src={item.imageUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='100' viewBox='0 0 120 100'%3E%3Crect width='120' height='100' fill='%23f0f0f0'/%3E%3Ccircle cx='60' cy='50' r='20' fill='%23d0d0d0'/%3E%3Ctext x='60' y='85' font-family='Arial' font-size='12' text-anchor='middle' fill='%23999'%3ENO IMAGE%3C/text%3E%3C/svg%3E`}
                            alt={item.name}
                            className="menu-item-image-horizontal"
                          />
                        </div>
                        <div className="menu-item-details-horizontal">
                          <p className="menu-item-name-horizontal"><strong>{item.name}</strong></p>
                          <p className="menu-item-description-horizontal">{item.description}</p>
                          <div className="menu-item-price-horizontal">₹{item.price}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Gallery Section */}
            <div className="detail-section">
              <h3 className="section-title">Gallery</h3>
              <div className="gallery-container">
                {vendor.images && vendor.images.length > 0 ? (
                  vendor.images.map((image, index) => (
                    <div key={index} className="gallery-item">
                      <img src={image.url} alt={`Gallery ${index + 1}`} className="gallery-image" />
                    </div>
                  ))
                ) : (
                  <p className="empty-state-smooth">No images available</p>
                )}
              </div>
            </div>
            
            {/* Location Button */}
            <div className="detail-section">
              <h3 className="section-title">Location</h3>
              <div className="section-action">
                <button onClick={() => navigate(`/customer/vendor/${vendorId}/location`)} className="btn-smooth secondary">
                  View Location
                </button>
              </div>
            </div>
            
            {/* Broadcast Messages - REMOVED RECENT MESSAGES PREVIEW */}
            <div className="detail-section">
              <h3 className="section-title">Broadcast Messages</h3>
              <div className="section-action">
                <button onClick={() => navigate(`/customer/vendor/${vendorId}/broadcasts`)} className="btn-smooth secondary">
                  View All Broadcasts
                </button>
              </div>
            </div>
            
            {/* Rating and Review */}
            <div className="detail-section">
              <h3 className="section-title">Rating and Reviews</h3>
              <div className="rating-container">
                <div className="rating-item">
                  <span className="rating-label"><strong>Average Rating: </strong></span>
                  <span className="average-rating">
                    {vendor.ratings?.average ? vendor.ratings.average.toFixed(1) : 'No ratings yet'}
                  </span>
                </div>
                <div className="rating-item">
                  <span className="rating-label"><strong>Your Rating:</strong></span>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRateVendor(star)}
                        className="star-button"
                        aria-label={`Rate ${star} stars`}>
                        <span className={star <= userRating ? 'star-filled' : 'star-empty'}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Write a Review Section */}
              <div className="add-comment-form">
                <h4 className="section-title">Write a Review</h4>
                <div className="comment-form">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your review..."
                    className="form-input-smooth"
                    rows="4"
                  />
                  <button onClick={handleSubmitComment} className="btn-smooth">
                    Submit Review
                  </button>
                </div>
              </div>
              
              {/* Existing Comments Section */}
              <div>
                <h4 className="section-title">Customer Comments</h4>
                {commentsLoading ? (
                  <div className="empty-state-smooth">
                    <p>Loading comments...</p>
                  </div>
                ) : vendorComments.length === 0 ? (
                  <div className="empty-state-smooth">
                    <p>No comments yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="comments-list-smooth">
                    {vendorComments.map((comment) => (
                      <div key={comment._id} className="comment-card-smooth">
                        <div className="comment-header-smooth">
                          <span className="comment-author">
                            <strong>{comment.authorName || 'Anonymous'}</strong>
                          </span>
                          <span className="comment-date-smooth">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="comment-content-smooth">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VendorDetail;