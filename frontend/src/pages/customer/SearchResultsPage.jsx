import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, userAPI } from '../../services/api';
import CustomerFooter from '../../components/CustomerFooter';
import './css/SearchResultsStyles.css';
import './css/CustomerDashboardStyles.css';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ vendors: [], menuItems: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  // Extract search query from URL on component mount and when location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults({ vendors: [], menuItems: [] });
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Search for menu items and vendors separately
      const [menuResponse, vendorResponse] = await Promise.all([
        vendorAPI.searchMenuItems(query),
        vendorAPI.searchVendors(query)
      ]);
      
      setSearchResults({
        menuItems: menuResponse.data || [],
        vendors: vendorResponse.data || []
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
      setSearchResults({ vendors: [], menuItems: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({ vendors: [], menuItems: [] });
    navigate('/customer/search');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
      setPincodeInput(pincodeInput);
    } catch (err) {
      console.error('Error updating pincode:', err);
      alert('Failed to update pincode. Please try again.');
    }
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
    <div className="search-results-page">
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
            <h1 className="navbar-logo" onClick={() => navigate('/customer/dashboard')}>
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

      {/* Main content */}
      <div className="search-results-container">
        {/* Header */}
        <header className="search-header">
          <h2 className="search-title">Search Results</h2>
        </header>

        {/* Search Form */}
        <section className="search-form-section">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for items or vendors..."
              className="search-form-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
            <button type="button" onClick={handleClearSearch} className="search-btn-clear">
              Clear
            </button>
          </form>
        </section>

        {/* Error message */}
        {error && (
          <div className="search-error">
            <p className="search-error-text">{error}</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="search-loading">
            <div className="search-loading-spinner"></div>
            <p className="search-loading-text">Searching...</p>
          </div>
        )}

        {/* Search results */}
        {!loading && (
          <section className="search-results-section">
            <div className="search-results-content">
              {/* Vendor Results */}
              {searchResults.vendors.length > 0 && (
                <div className="search-section-divider">
                  <h3 className="search-section-title">Vendors ({searchResults.vendors.length})</h3>
                  <div className="search-vendors-grid">
                    {searchResults.vendors.map((vendor) => (
                      <div key={vendor._id} className="search-vendor-card">
                        <h4 className="search-vendor-name">{vendor.businessName}</h4>
                        <p className="search-vendor-cuisine">{vendor.cuisineType}</p>
                        <p className="search-vendor-pincode">Pincode: {vendor.pincode}</p>
                        <button 
                          onClick={() => navigate(`/customer/vendor/${vendor._id}`)} 
                          className="search-vendor-btn"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Item Results */}
              {searchResults.menuItems.length > 0 && (
                <div className="search-section-divider">
                  <h3 className="search-section-title">Menu Items ({searchResults.menuItems.length})</h3>
                  <div className="search-menu-grid">
                    {searchResults.menuItems.map((item) => (
                      <div key={item._id} className="search-menu-card">
                        <div className="search-menu-content">
                          <h4 className="search-menu-name">{item.name}</h4>
                          <p className="search-menu-description">{item.description}</p>
                          <p className="search-menu-price">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        
                        <div className="search-menu-footer">
                          <div className="search-menu-vendor-info">
                            <p className="search-menu-vendor-name">{item.vendor.businessName}</p>
                            <p className="search-menu-category">{item.category || 'Food Item'}</p>
                          </div>
                          <button 
                            onClick={() => navigate(`/customer/vendor/${item.vendor._id}`)} 
                            className="search-menu-btn"
                          >
                            View Vendor
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {searchResults.vendors.length === 0 && searchResults.menuItems.length === 0 && searchQuery && (
                <div className="search-empty-state">
                  <h3 className="search-empty-title">No results found</h3>
                  <p className="search-empty-text">Try searching with different keywords</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      <CustomerFooter />
    </div>
  );
};

export default SearchResultsPage;