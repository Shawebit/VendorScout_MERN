import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, commentAPI, userAPI } from '../../services/api';
import CustomerFooter from '../../components/CustomerFooter';
import './css/VendorDetailStyles.css';
import './css/CustomerDashboardStyles.css';
import ErrorMessage from '../../components/common/ErrorMessage';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';

const FollowedVendorsDetail = () => {
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
  
  // Toast notification
  const { toast, showToast, hideToast } = useToast();

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
        if (ratingResponse.data.rating) {
          setUserRating(ratingResponse.data.rating.rating || 0);
        } else {
          setUserRating(0);
        }
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
        showToast('Successfully unfollowed vendor', 'success');
      } else {
        // Follow
        await vendorAPI.followVendor(vendorId);
        setFollowingStatus(true);
        showToast('Successfully followed vendor', 'success');
      }
    } catch (err) {
      console.error('Error following/unfollowing vendor:', err);
      showToast('Failed to update follow status. Please try again.', 'error');
    }
  };

  const handleRateVendor = async (ratingValue) => {
    try {
      await vendorAPI.rateVendor(vendorId, { rating: ratingValue });
      setUserRating(ratingValue);
    } catch (err) {
      console.error('Error rating vendor:', err);
      showToast('Failed to submit rating. Please try again.', 'error');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      showToast('Please enter a comment before submitting.', 'warning');
      return;
    }

    try {
      await commentAPI.createComment({
        content: commentText,
        vendorProfile: vendorId,
        pincode: vendor.pincode
      });
      setCommentText('');
      showToast('Review submitted successfully!', 'success');
      fetchVendorComments(vendorId);
    } catch (err) {
      console.error('Error submitting comment:', err);
      showToast('Failed to submit review. Please try again.', 'error');
    }
  };

  // Handle pincode search in navbar
  const handlePincodeSearch = async () => {
    if (!pincodeInput.trim()) {
      showToast('Please enter a pincode', 'warning');
      return;
    }
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincodeInput)) {
      showToast('Please enter a valid 6-digit pincode', 'warning');
      return;
    }
    
    try {
      // Save the pincode to the database
      await userAPI.updatePincode(pincodeInput);
      
      // Navigate to customer dashboard with the new pincode
      navigate('/customer/dashboard');
    } catch (err) {
      console.error('Error updating pincode:', err);
      showToast('Failed to update pincode. Please try again.', 'error');
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="customer-dashboard">
        {/* Navigation Bar - FIXED NAVBAR STYLING */}
        <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '0', borderBottom: '1px solid #000000' }}>
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
        {/* Navigation Bar - FIXED NAVBAR STYLING */}
        <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '0', borderBottom: '1px solid #000000' }}>
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
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="customer-dashboard">
        {/* Navigation Bar - FIXED NAVBAR STYLING */}
        <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '0', borderBottom: '1px solid #000000' }}>
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
            <h1 onClick={() => navigate('/customer/dashboard')} className="navbar-logo">
              VendorScout
            </h1>
          </div>
          
          <div className="navbar-right">
            <button onClick={() => navigate('/customer/map')} className="nav-link">
              Live Map
            </button>
            <button onClick={() => navigate('/customer/discussion')} className="nav-link">
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
      
      <div className="customer-dashboard-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Back Button */}
        <div style={{ marginBottom: '2rem' }}>
          <button onClick={() => navigate('/customer/followed')} style={{ background: 'none', border: '1px solid #000000', padding: '0.75rem 1.5rem', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>←</span> Back to Followed Vendors
          </button>
        </div>

        {/* Vendor Header */}
        <header style={{ marginBottom: '4rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem', color: '#000000' }}>{vendor.businessName}</h2>
              <p style={{ fontSize: '0.875rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{vendor.cuisineType}</p>
            </div>
            <button onClick={handleFollowVendor} className="nav-link logout-link" style={{ padding: '0.875rem 2rem' }}>
              {followingStatus ? 'Unfollow' : 'Follow'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>Status</span>
              <span className={vendor.status === 'open' ? 'vendor-status-open' : 'vendor-status-closed'} style={{ fontSize: '0.875rem' }}>
                {vendor.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>Pincode</span>
              <span style={{ fontSize: '0.875rem', color: '#000000' }}>{vendor.pincode}</span>
            </div>
          </div>
        </header>

        {/* Menu Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '2rem' }}>Menu</h3>
          {menuLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#666666' }}>Loading menu...</p>
            </div>
          ) : vendorMenuItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#666666' }}>No menu items available</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {vendorMenuItems.map((item) => (
                <div key={item._id} style={{ border: '1px solid #000000', overflow: 'hidden', backgroundColor: item.isAvailable ? '#ffffff' : '#f5f5f5' }}>
                  {item.imageUrl && (
                    <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                  )}
                  <div style={{ padding: '1.5rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: item.isAvailable ? '#000000' : '#999999' }}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingRight: '5rem' }}>{item.name}</h4>
                    <p style={{ fontSize: '0.8125rem', color: '#666666', marginBottom: '1rem', lineHeight: '1.5' }}>{item.description}</p>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#000000' }}>{formatPrice(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '2rem' }}>Gallery</h3>
          {vendor.images && vendor.images.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {vendor.images.map((image, index) => (
                <div key={index} style={{ aspectRatio: '4/3', overflow: 'hidden', border: '1px solid #e5e5e5' }}>
                  <img src={image.url} alt={`Gallery ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#666666' }}>No images available</p>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section style={{ marginBottom: '4rem', paddingBottom: '3rem', borderBottom: '1px solid #e5e5e5' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '2rem' }}>More Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <button onClick={() => navigate(`/customer/vendor/${vendorId}/location`)} className="nav-link logout-link" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
              View Location
            </button>
            <button onClick={() => navigate(`/customer/vendor/${vendorId}/broadcasts`)} className="nav-link logout-link" style={{ padding: '1rem 2rem', textAlign: 'center' }}>
              Broadcast Messages
            </button>
          </div>
        </section>

        {/* Rating and Review */}
        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '2rem' }}>Rate this Vendor</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>Average Rating</span>
              <span style={{ fontSize: '0.875rem', color: '#000000' }}>
                {vendor.ratings?.average ? vendor.ratings.average.toFixed(1) : 'No ratings yet'}
              </span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>Your Rating</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRateVendor(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0', color: star <= userRating ? '#FFD700' : '#e5e5e5' }}
                    aria-label={`Rate ${star} stars`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Write Review */}
          <div style={{ paddingTop: '2rem', borderTop: '1px solid #e5e5e5' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '1rem' }}>Write a Review</h4>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your experience..."
              maxLength="280"
              style={{ width: '100%', minHeight: '120px', padding: '1rem', border: '1px solid #000000', fontSize: '0.875rem', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#999999' }}>{commentText.length}/280</span>
              <button 
                onClick={handleSubmitComment} 
                className="nav-link logout-link"
                disabled={!commentText.trim()}
                style={{ padding: '0.875rem 2rem', opacity: !commentText.trim() ? 0.5 : 1, cursor: !commentText.trim() ? 'not-allowed' : 'pointer' }}
              >
                Submit Review
              </button>
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999' }}>Customer Reviews</h3>
            <span style={{ fontSize: '0.75rem', color: '#666666' }}>
              {vendorComments.length} {vendorComments.length === 1 ? 'review' : 'reviews'}
            </span>
          </div>
          
          {commentsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#666666' }}>Loading reviews...</p>
            </div>
          ) : vendorComments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#666666' }}>No reviews yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {vendorComments.map((comment) => (
                <div key={comment._id} style={{ border: '1px solid #e5e5e5', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f5f5f5' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        {comment.author?.name || 'Anonymous'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#999999' }}>
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#000000', lineHeight: '1.6' }}>{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <CustomerFooter />
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        duration={toast.duration}
      />
    </div>
  );
};

export default FollowedVendorsDetail;
