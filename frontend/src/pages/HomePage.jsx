import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI, commentAPI } from '../services/api';
import '../styles/globals.css';
import '../pages/HomePage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import VendorCard from '../components/VendorCard';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ menuItems: [], vendors: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorMenuItems, setVendorMenuItems] = useState([]);
  const [vendorComments, setVendorComments] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults({ menuItems: [], vendors: [] });
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Search for both menu items and vendors
      let menuResponse = { data: [] };
      let vendorResponse = { data: [] };
      
      try {
        menuResponse = await vendorAPI.searchMenuItems(searchQuery);
      } catch (menuErr) {
        console.warn('Failed to search menu items:', menuErr);
      }
      
      try {
        vendorResponse = await vendorAPI.searchVendors(searchQuery);
      } catch (vendorErr) {
        console.warn('Failed to search vendors:', vendorErr);
      }

      // Combine results
      const combinedResults = {
        menuItems: menuResponse.data || [],
        vendors: vendorResponse.data || []
      };

      setSearchResults(combinedResults);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Failed to search. Please try again.');
      setSearchResults({ menuItems: [], vendors: [] });
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendor menu items when a vendor is selected
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

  // Fetch vendor comments when a vendor is selected
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

  // Handle vendor selection
  const handleSelectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    await Promise.all([
      fetchVendorMenu(vendor._id),
      fetchVendorComments(vendor._id)
    ]);
  };

  // Close vendor detail view
  const handleCloseVendorDetail = () => {
    setSelectedVendor(null);
    setVendorMenuItems([]);
    setVendorComments([]);
  };

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Discover the best food & drinks</h1>
            <p className="hero-subtitle">Find and explore street food vendors near you</p>
            
            {/* Search Box */}
            <SearchBar 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearch}
              placeholder="Search..."
            />
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {searchQuery && !selectedVendor && (
        <section className="results-section">
          <div className="container">
            {/* Error message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="loading-container">
                <p>Searching</p>
              </div>
            )}

            {/* Search results */}
            {!loading && !error && (
              <div>
                {/* Vendor Results */}
                {searchResults.vendors.length > 0 && (
                  <div className="vendors-section">
                    <h2 className="section-title">Vendors ({searchResults.vendors.length})</h2>
                    <div className="vendors-grid">
                      {searchResults.vendors.map((vendor) => (
                        <VendorCard 
                          key={vendor._id} 
                          vendor={vendor} 
                          onSelectVendor={handleSelectVendor} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Menu Item Results */}
                {searchResults.menuItems.length > 0 && (
                  <div className="menu-section">
                    <h2 className="section-title">Menu Items ({searchResults.menuItems.length})</h2>
                    <div className="menu-grid">
                      {searchResults.menuItems.map((item) => (
                        <div key={item._id} className="menu-card">
                          <div className="menu-card-content">
                            <h3 className="menu-name">{item.name}</h3>
                            <p className="menu-description">{item.description}</p>
                            <div className="menu-price">
                              <span className="price-tag">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="menu-vendor-info">
                            <div className="vendor-details">
                              <p className="vendor-business-name">{item.vendor.businessName}</p>
                              <p className="menu-category">{item.category || 'Food Item'}</p>
                            </div>
                            <button 
                              onClick={() => handleSelectVendor(item.vendor)}
                              className="btn btn-secondary vendor-view-btn"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {searchResults.vendors.length === 0 && searchResults.menuItems.length === 0 && searchQuery && (
                  <div className="no-results">
                    <h3 className="no-results-title">No results found</h3>
                    <p>Try another search</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Vendor Detail View - shown when a vendor is selected */}
      {selectedVendor && (
        <section className="vendor-detail-section">
          <div className="container">
            <div className="vendor-detail-card">
              <div className="vendor-detail-header">
                <h2 className="vendor-detail-title">{selectedVendor.businessName}</h2>
                <button 
                  onClick={handleCloseVendorDetail}
                  className="btn-close-detail"
                >
                  Back
                </button>
              </div>
              
              {/* Vendor Information */}
              <div className="vendor-info-section">
                <h3 className="section-subtitle">Vendor Information</h3>
                <div className="vendor-info-grid">
                  <div className="info-item">
                    <p><strong>Cuisine Type:</strong> {selectedVendor.cuisineType}</p>
                    <p><strong>Pincode:</strong> {selectedVendor.pincode}</p>
                  </div>
                  <div className="info-item">
                    <p><strong>Status:</strong> {selectedVendor.status || 'Open'}</p>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="menu-items-section">
                <h3 className="section-subtitle">Menu Items</h3>
                
                {menuLoading ? (
                  <div className="loading-container">
                    <p>Loading menu</p>
                  </div>
                ) : vendorMenuItems.length > 0 ? (
                  <div className="vendor-menu-grid">
                    {vendorMenuItems.map((item) => (
                      <div key={item._id} className="vendor-menu-card">
                        <h4 className="menu-item-name">{item.name}</h4>
                        <p className="menu-item-description">{item.description}</p>
                        <div className="menu-item-footer">
                          <span className="menu-item-price">{formatPrice(item.price)}</span>
                          <span className={`availability ${!item.isAvailable ? 'not-available' : ''}`}>
                            {item.isAvailable ? 'In stock' : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No menu items available</p>
                  </div>
                )}
              </div>
              
              {/* Comments/Reviews */}
              <div className="comments-section">
                <h3 className="section-subtitle">Customer Reviews</h3>
                
                {commentsLoading ? (
                  <div className="loading-container">
                    <p>Loading reviews</p>
                  </div>
                ) : vendorComments.length > 0 ? (
                  <div className="comments-list">
                    {vendorComments.map((comment) => (
                      <div key={comment._id} className="comment-card">
                        <div className="comment-header">
                          <strong className="comment-author">{comment.user?.username || 'Anonymous'}</strong>
                          <span className="comment-date">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How VendorScout Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3 className="feature-title">Explore Vendors</h3>
              <p className="feature-description">Browse through handpicked street food vendors in your area</p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Track Live Location</h3>
              <p className="feature-description">See real-time location of vendors and estimated arrival times</p>
            </div>
            <div className="feature-card">
              <h3 className="feature-title">Share Experiences</h3>
              <p className="feature-description">Read reviews and share your own experiences with the community</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;