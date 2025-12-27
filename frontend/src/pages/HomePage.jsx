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
    <div className="homepage-modern">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section-modern">
        <div className="container-modern">
          <div className="hero-content-modern">
            <h1 className="hero-title-modern">Discover Local Street Food Vendors</h1>
            <p className="hero-subtitle-modern">Find and explore authentic street food vendors near you with real-time tracking and community reviews</p>
            
            {/* Search Box */}
            <div className="search-container-modern">
              <form onSubmit={handleSearch} className="search-form-modern">
                <div className="search-input-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for vendors or menu items..."
                    className="search-input-modern"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="search-clear-btn-modern">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                  )}
                </div>
                <button type="submit" className="search-button-modern">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section-modern">
        <div className="container-modern">
          <div className="stats-grid-modern">
            <div className="stat-card-modern">
              <div className="stat-number">500+</div>
              <div className="stat-label">Vendors</div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Customers</div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Section */}
      {searchQuery && !selectedVendor && (
        <section className="results-section-modern">
          <div className="container-modern">
            {/* Error message */}
            {error && (
              <div className="error-message-modern">
                {error}
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="loading-container-modern">
                <div className="loading-spinner"></div>
                <p>Searching vendors and menu items...</p>
              </div>
            )}

            {/* Search results */}
            {!loading && !error && (
              <div>
                {/* Vendor Results */}
                {searchResults.vendors.length > 0 && (
                  <div className="vendors-section-modern">
                    <h2 className="section-title-modern">Vendors ({searchResults.vendors.length})</h2>
                    <div className="vendors-grid-modern">
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
                  <div className="menu-section-modern">
                    <h2 className="section-title-modern">Menu Items ({searchResults.menuItems.length})</h2>
                    <div className="menu-grid-modern">
                      {searchResults.menuItems.map((item) => (
                        <div key={item._id} className="menu-card-modern">
                          <div className="menu-card-content-modern">
                            <h3 className="menu-name-modern">{item.name}</h3>
                            <p className="menu-description-modern">{item.description}</p>
                            <div className="menu-price-modern">
                              <span className="price-tag-modern">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="menu-vendor-info-modern">
                            <div className="vendor-details-modern">
                              <p className="vendor-business-name-modern">{item.vendor.businessName}</p>
                              <p className="menu-category-modern">{item.category || 'Food Item'}</p>
                            </div>
                            <button 
                              onClick={() => handleSelectVendor(item.vendor)}
                              className="btn btn-secondary vendor-view-btn-modern"
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
                  <div className="no-results-modern">
                    <svg className="no-results-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                      <path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                    <h3 className="no-results-title-modern">No results found</h3>
                    <p>Try another search or browse our featured vendors</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Vendor Detail View - shown when a vendor is selected */}
      {selectedVendor && (
        <section className="vendor-detail-section-modern">
          <div className="container-modern">
            <div className="vendor-detail-card-modern">
              <div className="vendor-detail-header-modern">
                <h2 className="vendor-detail-title-modern">{selectedVendor.businessName}</h2>
                <button 
                  onClick={handleCloseVendorDetail}
                  className="btn-close-detail-modern"
                >
                  Back to Results
                </button>
              </div>
              
              {/* Vendor Information */}
              <div className="vendor-info-section-modern">
                <h3 className="section-subtitle-modern">Vendor Information</h3>
                <div className="vendor-info-grid-modern">
                  <div className="info-item-modern">
                    <span className="info-label">Cuisine Type</span>
                    <span className="info-value">{selectedVendor.cuisineType}</span>
                  </div>
                  <div className="info-item-modern">
                    <span className="info-label">Pincode</span>
                    <span className="info-value">{selectedVendor.pincode}</span>
                  </div>
                  <div className="info-item-modern">
                    <span className="info-label">Status</span>
                    <span className={`info-value status-value status-value--${selectedVendor.status?.toLowerCase() || 'open'}`}>{selectedVendor.status || 'Open'}</span>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="menu-items-section-modern">
                <h3 className="section-subtitle-modern">Menu Items</h3>
                
                {menuLoading ? (
                  <div className="loading-container-modern">
                    <div className="loading-spinner"></div>
                    <p>Loading menu items...</p>
                  </div>
                ) : vendorMenuItems.length > 0 ? (
                  <div className="vendor-menu-grid-modern">
                    {vendorMenuItems.map((item) => (
                      <div key={item._id} className="vendor-menu-card-modern">
                        <h4 className="menu-item-name-modern">{item.name}</h4>
                        <p className="menu-item-description-modern">{item.description}</p>
                        <div className="menu-item-footer-modern">
                          <span className="menu-item-price-modern">{formatPrice(item.price)}</span>
                          <span className={`availability-modern ${!item.isAvailable ? 'not-available-modern' : ''}`}>
                            {item.isAvailable ? 'In stock' : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <p>No menu items available</p>
                  </div>
                )}
              </div>
              
              {/* Comments/Reviews */}
              <div className="comments-section-modern">
                <h3 className="section-subtitle-modern">Customer Reviews</h3>
                
                {commentsLoading ? (
                  <div className="loading-container-modern">
                    <div className="loading-spinner"></div>
                    <p>Loading reviews...</p>
                  </div>
                ) : vendorComments.length > 0 ? (
                  <div className="comments-list-modern">
                    {vendorComments.map((comment) => (
                      <div key={comment._id} className="comment-card-modern">
                        <div className="comment-header-modern">
                          <strong className="comment-author-modern">{comment.user?.username || 'Anonymous'}</strong>
                          <span className="comment-date-modern">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="comment-content-modern">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-modern">
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="how-it-works-modern">
        <div className="container-modern">
          <h2 className="section-title-modern">How VendorScout Works</h2>
          <div className="features-grid-modern">
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </div>
              <h3 className="feature-title-modern">Explore Vendors</h3>
              <p className="feature-description-modern">Browse through handpicked street food vendors in your area with detailed information and real-time status</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0s-5.5 4.5-5.5 11.5A5.5 5.5 0 0 0 8 16s5.5-4.5 5.5-11.5A5.5 5.5 0 0 0 8 0zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-3.5-1a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0z"/>
                </svg>
              </div>
              <h3 className="feature-title-modern">Track Live Location</h3>
              <p className="feature-description-modern">See real-time location of vendors and estimated arrival times with our interactive map</p>
            </div>
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                </svg>
              </div>
              <h3 className="feature-title-modern">Share Experiences</h3>
              <p className="feature-description-modern">Read reviews and share your own experiences with the community to help others discover great vendors</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;