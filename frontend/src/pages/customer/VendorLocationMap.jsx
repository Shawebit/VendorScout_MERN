import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, userAPI } from '../../services/api';
import CustomerFooter from '../../components/CustomerFooter';
import './css/VendorLocationMapMinimal.css';
import './css/CustomerDashboardStyles.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VendorLocationMap = () => {
  const { vendorId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getVendorById(vendorId);
      setVendor(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch vendor details:', err);
      setError('Failed to load vendor details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle pincode search in navbar
  const handlePincodeSearch = async () => {
    if (!pincodeInput.trim()) {
      setError('Please enter a pincode');
      return;
    }
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(pincodeInput)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    
    try {
      // Save the pincode to the database
      await userAPI.updatePincode(pincodeInput);
      
      // Set the customer pincode
      setPincodeInput(pincodeInput);
      setError('');
    } catch (err) {
      console.error('Error updating pincode:', err);
      setError('Failed to update pincode. Please try again.');
    }
  };

  const getDirections = () => {
    if (vendor && vendor.location && vendor.location.coordinates) {
      const lat = vendor.location.coordinates[1];
      const lng = vendor.location.coordinates[0];
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      setError('Vendor location is not available');
    }
  };

  if (loading) {
    return (
      <div className="vendor-location-map">
        {/* Navigation Bar */}
        <nav className="vendor-location-map-nav">
          <div className="nav-container">
            <div className="nav-left">
              <h1 onClick={() => navigate('/customer/dashboard')} className="nav-logo">VendorScout</h1>
                  
              {/* Pincode input in navbar - moved to left side */}
              <div className="pincode-container">
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
                
            <div className="nav-right">
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
      
        <LoadingSpinner message="Loading vendor location..." />
      </div>
    );
  }

  return (
    <div className="vendor-location-map">
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

      {/* Full Screen Map Section */}
      <div className="map-section">
        <div className="map-content">
          {/* Back Button and Header */}
          <div className="location-header-section">
            <button
              onClick={() => navigate(`/customer/vendor/${vendorId}`)}
              className="btn-smooth secondary back-button"
            >
              ← Back to Vendor
            </button>
            
            <div className="vendor-info-header">
              <div>
                <h3 className="vendor-name">{vendor?.businessName || 'Vendor Location'}</h3>
                <p className="vendor-cuisine">{vendor?.cuisineType || ''}</p>
              </div>
            </div>
          </div>
          
          {/* Map and Details Grid Layout */}
          <div className="map-details-grid">
            {/* Interactive Map */}
            <div className="map-container">
              {vendor && vendor.location && vendor.location.coordinates ? (
                <>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${vendor.location.coordinates[1]},${vendor.location.coordinates[0]}&zoom=16`}>
                  </iframe>
                  <div className="map-marker-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    <span>Vendor Location</span>
                    <div className="map-marker-pulse"></div>
                  </div>
                </>
              ) : (
                <div className="map-placeholder">
                  <div className="map-placeholder-icon"></div>
                  <h3 className="map-placeholder-title">Location Map</h3>
                  <p className="map-placeholder-text">
                    {vendor?.address 
                      ? `${vendor.address}, Pincode: ${vendor.pincode}`
                      : vendor?.pincode ? `Location: Pincode ${vendor.pincode}` : 'Location not available'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Vendor Details Card */}
            <div className="vendor-details-card">
              <div className="vendor-card-header">
                <h4 className="vendor-details-title">Vendor Information</h4>
              </div>
              
              {/* Business Info */}
              <div className="business-info-section">
                <div className="vendor-detail-item">
                  <span className="detail-label">Business Name</span>
                  <span className="detail-value">{vendor?.businessName || 'N/A'}</span>
                </div>
                <div className="vendor-detail-item">
                  <span className="detail-label">Cuisine Type</span>
                  <span className="detail-value">{vendor?.cuisineType || 'N/A'}</span>
                </div>
                <div className="vendor-detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">
                    {vendor?.phoneNumber ? (
                      <a href={`tel:${vendor.phoneNumber}`} className="phone-link">
                        {vendor.phoneNumber}
                      </a>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="vendor-detail-item">
                  <span className="detail-label">Pincode</span>
                  <span className="detail-value">{vendor?.pincode || 'N/A'}</span>
                </div>
                {vendor?.address && (
                  <div className="vendor-detail-item full-width">
                    <span className="detail-label">Address</span>
                    <span className="detail-value address-value">{vendor.address}</span>
                  </div>
                )}
              </div>

              {/* Location Info */}
              {vendor?.location && vendor.location.coordinates && (
                <div className="location-info-section">
                  <h5 className="info-section-title">Location Details</h5>
                  <div className="vendor-detail-item">
                    <span className="detail-label">Latitude</span>
                    <span className="detail-value coordinate-value">
                      {vendor.location.coordinates[1].toFixed(6)}
                    </span>
                  </div>
                  <div className="vendor-detail-item">
                    <span className="detail-label">Longitude</span>
                    <span className="detail-value coordinate-value">
                      {vendor.location.coordinates[0].toFixed(6)}
                    </span>
                  </div>
                  {vendor.location.accuracy && (
                    <div className="vendor-detail-item">
                      <span className="detail-label">Accuracy</span>
                      <span className="detail-value">{vendor.location.accuracy.toFixed(0)} meters</span>
                    </div>
                  )}
                  {vendor.officename && (
                    <div className="vendor-detail-item">
                      <span className="detail-label">Area</span>
                      <span className="detail-value">{vendor.officename}</span>
                    </div>
                  )}
                  {vendor.location.timestamp && (
                    <div className="vendor-detail-item">
                      <span className="detail-label">Last Updated</span>
                      <span className="detail-value">
                        {new Date(vendor.location.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={getDirections}
              className="action-button"
              disabled={!vendor}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Get Directions
            </button>
            
            <button
              onClick={() => {
                if (vendor && vendor.location && vendor.location.coordinates) {
                  const lat = vendor.location.coordinates[1];
                  const lng = vendor.location.coordinates[0];
                  const locationLink = `https://www.google.com/maps?q=${lat},${lng}`;
                  
                  navigator.clipboard.writeText(locationLink)
                    .then(() => {
                      setError('');
                      // You could add a success message state here
                    })
                    .catch(err => {
                      console.error('Failed to copy location link: ', err);
                      setError('Failed to copy link');
                    });
                } else {
                  setError('Vendor location is not available');
                }
              }}
              className="action-button"
              disabled={!vendor}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share Location
            </button>
          </div>
        </div>
      </div>
      <CustomerFooter />
    </div>
  );
};

export default VendorLocationMap;