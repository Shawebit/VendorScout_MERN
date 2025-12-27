import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, commentAPI, userAPI } from '../../services/api';
import VendorMap from "../../components/VendorMap";
import VendorCard from "../../components/VendorCard";
import CustomerFooter from '../../components/CustomerFooter';
import './css/CustomerDashboardStyles.css';
import StarRating from '../../components/common/StarRating';
import Toast from '../../components/common/Toast';
import useToast from '../../hooks/useToast';

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
  
  // Toast notification
  const { toast, showToast, hideToast } = useToast();

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
          // Store the actual rating value, not the entire object
          if (response.data.rating) {
            status[vendor._id] = response.data.rating.rating;
          } else {
            status[vendor._id] = null;
          }
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
        showToast('Successfully unfollowed vendor', 'success');
      } else {
        // Follow
        await vendorAPI.followVendor(vendorId);
        setFollowingStatus(prev => ({
          ...prev,
          [vendorId]: true
        }));
        showToast('Successfully followed vendor', 'success');
      }

      // Refresh vendor data to get updated follower count
      if (showVendors) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Error following/unfollowing vendor:', err);
      showToast('Failed to update follow status. Please try again.', 'error');
    }
  };

  // Function to rate a vendor
  const handleRateVendor = async (vendorId, ratingValue) => {
    try {
      // Submit rating
      await vendorAPI.rateVendor(vendorId, { rating: ratingValue });

      // Update rating status with the actual rating value
      setRatingStatus(prev => ({
        ...prev,
        [vendorId]: ratingValue
      }));

      showToast('Rating submitted successfully!', 'success');

      // Refresh vendor data to get updated ratings
      if (showVendors) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Error rating vendor:', err);
      showToast('Failed to submit rating. Please try again.', 'error');
    }
  };

  // Function to submit a comment/review
  const handleSubmitComment = async (vendorId, vendorPincode) => {
    if (!commentText.trim()) {
      showToast('Please enter a comment before submitting.', 'warning');
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
      showToast('Review submitted successfully!', 'success');
      // Refresh vendor comments
      fetchVendorComments(vendorId);
      // Refresh vendor data to get updated comments
      if (showVendors) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      showToast('Failed to submit review. Please try again.', 'error');
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
      {/* Modern Navigation Bar */}
      <nav className="customer-navbar">
        <div className="customer-navbar-container">
          {/* Left section - Pincode search */}
          <div className="navbar-left">
            <div className="pincode-search-container">
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter pincode"
                className="pincode-input"
              />
              <button
                onClick={handlePincodeSearch}
                className="pincode-btn"
                aria-label="Search by pincode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center section - Logo */}
          <div className="navbar-center">
            <h1 onClick={() => navigate('/customer/dashboard')} className="navbar-logo">
              VendorScout
            </h1>
          </div>

          {/* Right section - Navigation links */}
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

      {/* Main dashboard container */}
      <div className="customer-dashboard-container">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">Discover Local Vendors</h1>
          <p className="hero-subtitle">Find the best street food vendors near you</p>
        </section>

        {/* Search Bar */}
        <section className="search-section">
          <form onSubmit={handleSearch} className="search-form-hero">
            <div className="search-input-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="search-icon">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for vendors or menu items..."
                className="search-input-hero"
              />
              {searchQuery && (
                <button type="button" onClick={handleClearSearch} className="search-clear-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                  </svg>
                </button>
              )}
            </div>
            <button type="submit" className="search-btn-hero">
              Search
            </button>
          </form>
        </section>

        {/* Filters Bar */}
        <section className="filters-bar">
          <div className="filters-container">
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="filter-select"
              aria-label="Filter by cuisine type"
            >
              {cuisineOptions.map((option) => (
                <option key={option} value={option}>
                  {option || 'All Cuisines'}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="open">Open Now</option>
              <option value="relocating">Relocating</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="filter-select"
              aria-label="Filter by rating"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
              aria-label="Sort by"
            >
              <option value="name">Sort by Name</option>
              <option value="rating">Highest Rated</option>
              <option value="distance">Nearest First</option>
            </select>

            <button onClick={handleApplyFilters} className="filter-apply-btn">
              Apply
            </button>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div className="error-banner">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading vendors...</p>
          </div>
        )}

        {/* Vendors Grid */}
        {!loading && !selectedVendor && showVendors && (
          <section className="vendors-grid-section">
            <div className="section-header-bar">
              <h2 className="section-heading">Nearby Vendors</h2>
              <span className="results-count">{filteredVendors.length} results</span>
            </div>

            {filteredVendors.length === 0 ? (
              <div className="empty-results">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16" className="empty-icon">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                </svg>
                <h3>No vendors found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="vendors-grid-modern">
                {filteredVendors.map((vendor) => (
                  <VendorCard 
                    key={vendor._id} 
                    vendor={vendor} 
                    onSelectVendor={handleSelectVendor} 
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Empty state when no pincode */}
        {!showVendors && !selectedVendor && (
          <div className="welcome-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 16 16" className="welcome-icon">
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <h2>Welcome, {user?.username || user?.email}</h2>
            <p>Enter your pincode in the navbar above to discover vendors near you</p>
          </div>
        )}
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

export default CustomerDashboard;