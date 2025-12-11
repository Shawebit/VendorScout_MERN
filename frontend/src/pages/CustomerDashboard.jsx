import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, commentAPI, userAPI } from '../services/api';
import VendorMap from "../components/VendorMap";
import CustomerFooter from '../components/CustomerFooter';
import './CustomerDashboardStyles.css';

// Star rating component
const StarRating = ({ rating, onRatingChange, interactive = true }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}
        >
          <span></span>
        </button>
      ))}
    </div>
  );
};

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    cuisine: '',
    status: '',
    rating: '',
    sortBy: 'name'
  });
  const [followingStatus, setFollowingStatus] = useState({}); // Track following status for each vendor
  const [ratingStatus, setRatingStatus] = useState({}); // Track rating status for each vendor
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedVendor, setSelectedVendor] = useState(null); // Track selected vendor for detailed view
  const [commentText, setCommentText] = useState(''); // Track comment text for reviews
  const [vendorComments, setVendorComments] = useState([]); // Track comments for selected vendor
  const [commentsLoading, setCommentsLoading] = useState(false); // Track comments loading state
  const [vendorMenuItems, setVendorMenuItems] = useState([]); // Track menu items for selected vendor
  const [menuLoading, setMenuLoading] = useState(false); // Track menu loading state
  const [customerPincode, setCustomerPincode] = useState(user?.pincode || ''); // Track customer's pincode
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || ''); // Track pincode input field
  const [showVendors, setShowVendors] = useState(!!user?.pincode); // Show vendors if pincode already exists

  // Predefined cuisine options for the dropdown
  const cuisineOptions = [
    '',
    'North Indian',
    'South Indian',
    'Chinese',
    'Italian',
    'Mexican',
    'Continental',
    'Street Food',
    'Fast Food',
    'Beverages',
    'Desserts'
  ];

  // Fetch vendors from the database when component mounts
  useEffect(() => {
    // If user already has a pincode, fetch vendors immediately
    if (user?.pincode) {
      setCustomerPincode(user.pincode);
      setPincodeInput(user.pincode);
      setShowVendors(true);
      fetchVendors();
    } else {
      setLoading(false);
    }
  }, [user]);



  const fetchVendors = async (filterParams = null) => {
    try {
      setLoading(true);
      // Use provided filters or default to state filters
      const filtersToUse = filterParams || filters;

      // Add pincode filter
      const finalFilters = {
        ...filtersToUse,
        pincode: customerPincode
      };

      // Pass filters as query parameters
      const response = await vendorAPI.getAllVendors(finalFilters);

      // Set vendors
      setVendors(response.data);
      setError('');



      // Check following status for each vendor
      checkFollowingStatus(response.data);

      // Check rating status for each vendor
      checkRatingStatus(response.data);

    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments and menu when a vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      fetchVendorComments(selectedVendor._id);
      fetchVendorMenu(selectedVendor._id);
    } else {
      setVendorComments([]); // Clear comments when no vendor is selected
      setVendorMenuItems([]); // Clear menu items when no vendor is selected
    }
  }, [selectedVendor]);

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

  const checkFollowingStatus = async (vendorsList) => {
    try {
      const status = {};
      for (const vendor of vendorsList) {
        try {
          const response = await vendorAPI.isFollowingVendor(vendor._id);
          status[vendor._id] = response.data.isFollowing;
        } catch (err) {
          console.error(`Error checking follow status for vendor ${vendor._id}:`, err);
          status[vendor._id] = false;
        }
      }
      setFollowingStatus(status);
    } catch (err) {
      console.error('Error checking following status:', err);
    }
  };

  const checkRatingStatus = async (vendorsList) => {
    try {
      const status = {};
      for (const vendor of vendorsList) {
        try {
          const response = await vendorAPI.getVendorRatingByCustomer(vendor._id);
          status[vendor._id] = response.data.rating;
        } catch (err) {
          console.error(`Error checking rating status for vendor ${vendor._id}:`, err);
          status[vendor._id] = null;
        }
      }
      setRatingStatus(status);
    } catch (err) {
      console.error('Error checking rating status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // New function to manually apply filters
  const handleApplyFilters = () => {
    if (showVendors) {
      fetchVendors();
    }
  };

  // Function to follow a vendor
  const handleFollowVendor = async (vendorId) => {
    try {
      if (followingStatus[vendorId]) {
        // Unfollow
        await vendorAPI.unfollowVendor(vendorId);
        setFollowingStatus(prev => ({
          ...prev,
          [vendorId]: false
        }));
      } else {
        // Follow
        await vendorAPI.followVendor(vendorId);
        setFollowingStatus(prev => ({
          ...prev,
          [vendorId]: true
        }));
      }

      // Refresh vendor data to get updated follower count
      if (showVendors) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Error following/unfollowing vendor:', err);
      alert('Failed to update follow status. Please try again.');
    }
  };

  // Function to rate a vendor
  const handleRateVendor = async (vendorId, ratingValue) => {
    try {
      // Submit rating
      await vendorAPI.rateVendor(vendorId, { rating: ratingValue });

      // Update rating status
      setRatingStatus(prev => ({
        ...prev,
        [vendorId]: { rating: ratingValue }
      }));

      // Refresh vendor data to get updated ratings
      if (showVendors) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Error rating vendor:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Function to submit a comment/review
  const handleSubmitComment = async (vendorId, vendorPincode) => {
    if (!commentText.trim()) {
      alert('Please enter a comment before submitting.');
      return;
    }

    try {
      // Use the correct API method for creating comments
      await commentAPI.createComment({
        content: commentText,
        vendorProfile: vendorId,
        pincode: vendorPincode
      });
      setCommentText(''); // Clear comment text after submission
      alert('Review submitted successfully!');
      // Refresh vendor comments
      fetchVendorComments(vendorId);
      // Refresh vendor data to get updated comments
      if (showVendors) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  // Function to search menu items and vendors - redirects to search results page
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Function to clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Function to select a vendor for detailed view
  const handleSelectVendor = (vendor) => {
    // Navigate to the dedicated vendor detail page instead of showing embedded details
    navigate(`/customer/vendor/${vendor._id}`);
  };

  // Function to close vendor detail view
  const handleCloseVendorDetail = () => {
    setSelectedVendor(null);
    setCommentText(''); // Clear comment text when closing
  };

  // Function to handle pincode search
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

      // Set the customer pincode and show vendors
      setCustomerPincode(pincodeInput);
      setShowVendors(true);
      
      // Set up hard refresh after 2 seconds
      setTimeout(() => {
        window.location.reload(true);
      }, 300);
    } catch (err) {
      console.error('Error updating pincode:', err);
      alert('Failed to update pincode. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group menu items by category
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

  const filteredVendors = vendors.filter(vendor => {
    if (filters.cuisine && !vendor.cuisineType.toLowerCase().includes(filters.cuisine.toLowerCase())) {
      return false;
    }
    // Note: Vendor model doesn't have a rating field, so we'll skip rating filter for now
    if (filters.status && vendor.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Format vendor data to match the existing UI structure
  const formatVendorData = (vendor) => {
    return {
      id: vendor._id,
      name: vendor.businessName,
      cuisine: vendor.cuisineType,
      // Vendor model doesn't have a rating field, using a default value
      rating: vendor.ratings?.average || 0,
      // Distance is not stored in the database, using a placeholder
      distance: '0.5 km',
      status: vendor.status || 'open',
      // Using a placeholder image to avoid CORS issues
      image: vendor.images && vendor.images.length > 0
        ? vendor.images[0].url
        : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E`,
      pincode: vendor.pincode,
      // Add location coordinates if available
      coordinates: vendor.location?.coordinates || null,
      accuracy: vendor.location?.accuracy || null
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };



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
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
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

      {/* Main dashboard container */}
      <div className="customer-dashboard-container">
        {/* Dashboard header */}
        <header className="dashboard-card">
          <div>
            <h2 className="section-title">Customer Dashboard</h2>
          </div>
          <div>
            <h3 className="section-subtitle">Welcome, {user?.username || user?.email}</h3>
          </div>
        </header>

        {/* Dashboard search section */}
        <section className="dashboard-card">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for items or vendors..."
              className="form-input-smooth"
            />
            <button type="submit" className="btn-smooth">
              Search
            </button>
            <button type="button" onClick={handleClearSearch} className="btn-smooth secondary">
              Clear
            </button>
          </form>
        </section>

        {/* Error message section */}
        {error && (
          <section className="dashboard-card" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <div>
              {error}
            </div>
          </section>
        )}

        {/* Loading indicator section */}
        {loading && (
          <section className="dashboard-card empty-state-smooth">
            <div>
              <div></div>
              <p>Loading vendors...</p>
            </div>
          </section>
        )}

        {/* Always show filter section, even when no vendors are displayed */}
        <section className="dashboard-card">
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <div>
                <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className="form-input-smooth"
                  aria-label="Filter by cuisine type"
                >
                  {cuisineOptions.map((option) => (
                    <option key={option} value={option}>
                      {option || 'Any Cuisine'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="form-input-smooth"
                  aria-label="Filter by status"
                >
                  <option value="">Any Status</option>
                  <option value="open">Open</option>
                  <option value="relocating">Relocating</option>
                  <option value="closed">Closed</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="form-input-smooth"
                  aria-label="Filter by minimum rating"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>

              <div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="form-input-smooth"
                  aria-label="Sort by"
                >
                  <option value="name">Name</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                  <option value="price_low">Lowest Price</option>
                  <option value="price_high">Highest Price</option>
                </select>
              </div>

              <div>
                <button onClick={handleApplyFilters} className="btn-smooth" style={{ alignSelf: 'flex-end', height: 'fit-content' }}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </section>

        {!loading && !selectedVendor && showVendors && (
          <>
            {/* Vendor cards section */}
            <section className="dashboard-card">
              <div>
                <div className="vendor-list-header">
                  <h3 className="section-title">Nearby Vendors</h3>
                  <span>{filteredVendors.length} vendors found</span>
                </div>

                {filteredVendors.length === 0 ? (
                  <div className="empty-state-smooth">
                    <div></div>
                    <h4 className="no-vendors-title">No vendors found</h4>
                    <p>Try adjusting your filters to see more results.</p>
                  </div>
                ) : (
                  <div className="vendors-grid">
                    {filteredVendors.map((vendor) => {
                      const formattedVendor = formatVendorData(vendor);
                      const userRating = ratingStatus[vendor._id]?.rating || 0;

                      return (
                        <div key={formattedVendor.id}>
                          {/* Vendor Card - Clickable to view details */}
                          <div
                            onClick={() => handleSelectVendor(vendor)}
                            className="vendor-card-smooth"
                          >
                            <div className="vendor-card-header">
                              <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{formattedVendor.name}</h4>
                              <div style={{ marginBottom: '0.25rem' }}>
                                <span>Rating: {formattedVendor.rating.toFixed(1)}</span>
                              </div>
                              <div>
                                <span>Cuisine: {formattedVendor.cuisine}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {!showVendors && !selectedVendor && (
          <section className="dashboard-card empty-state-smooth">
            <div>
              <h3 className="find-vendors-title">Find Vendors Near You</h3>
              <p>Please enter your pincode in the navbar above to see nearby vendors.</p>
            </div>
          </section>
        )}
      </div>
      <CustomerFooter />
    </div>
  );
};

export default CustomerDashboard;