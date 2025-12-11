import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, userAPI } from '../services/api';
import CustomerFooter from '../components/CustomerFooter';
import './CustomerDashboardStyles.css';

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
    <div className="customer-dashboard">
      {/* Navigation Bar - FIXED NAVBAR STYLING TO MATCH OTHER PAGES */}
      <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 onClick={() => navigate('/customer/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
            
            {/* Pincode input in navbar - FIXED WIDTH */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter pincode"
                className="form-input-smooth"
                style={{ width: '120px' }} // FIXED WIDTH FOR PINCODE INPUT
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

      {/* Main content */}
      <div className="discussion-container">
        {/* Dashboard header */}
        <header className="dashboard-card">
          <div className="discussion-header-content">
            <h2 className="section-title">Search Results</h2>
          </div>
        </header>

        {/* Search section */}
        <section className="dashboard-card">
          <form onSubmit={handleSubmit} className="search-form">
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

        {/* Error message */}
        {error && (
          <section className="dashboard-card error-message">
            <div>
              {error}
            </div>
          </section>
        )}

        {/* Loading indicator */}
        {loading && (
          <section className="dashboard-card empty-state-smooth">
            <div>
              <div></div>
              <p>Searching...</p>
            </div>
          </section>
        )}

        {/* Search results */}
        {!loading && (
          <section className="dashboard-card">
            <div>
              <h3 className="discussion-section-title">Search Results</h3>
            </div>
            
            <div>
              {/* Vendor Results */}
              {searchResults.vendors.length > 0 && (
                <div className="search-results-section">
                  <h4 className="search-results-subtitle">Vendors ({searchResults.vendors.length})</h4>
                  <div className="vendors-grid">
                    {searchResults.vendors.map((vendor) => (
                      <div key={vendor._id} className="vendor-card-smooth">
                        <div className="vendor-card-header">
                          <h5>{vendor.businessName}</h5>
                          <p>{vendor.cuisineType}</p>
                          <p>Pincode: {vendor.pincode}</p>
                        </div>
                        <div className="vendor-card-body">
                          <button onClick={() => navigate(`/customer/vendor/${vendor._id}`)} className="btn-smooth">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Item Results */}
              {searchResults.menuItems.length > 0 && (
                <div className="search-results-section">
                  <h4 className="search-results-subtitle">Menu Items ({searchResults.menuItems.length})</h4>
                  <div className="menu-items-grid">
                    {searchResults.menuItems.map((item) => (
                      <div key={item._id} className="menu-item-card-smooth">
                        <div>
                          <h5>{item.name}</h5>
                          <p>{item.description}</p>
                          <div>
                            <span className="menu-item-price">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="menu-item-footer">
                          <div>
                            <p className="vendor-name">{item.vendor.businessName}</p>
                            <p className="menu-category">{item.category || 'Food Item'}</p>
                          </div>
                          <button onClick={() => navigate(`/customer/vendor/${item.vendor._id}`)} className="btn-smooth">
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
                <div className="empty-state-smooth">
                  <div></div>
                  <h4 className="no-comments-title">No results found</h4>
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