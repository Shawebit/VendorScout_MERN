import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, userAPI } from '../services/api';
import CustomerFooter from '../components/CustomerFooter';
import './VendorLocationMapStyles.css';

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

  const getDirections = () => {
    if (vendor && vendor.location && vendor.location.coordinates) {
      const lat = vendor.location.coordinates[1];
      const lng = vendor.location.coordinates[0];
      // Open Google Maps with directions to the vendor's location
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      alert('Vendor location is not available');
    }
  };

  if (loading) {
    return (
      <div className="vendor-location-map">
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

        <div className="loading-state">
          <p className="loading-text">Loading vendor location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-location-map">
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

      {/* Full Screen Map Section */}
      <div className="map-section">
        <div className="map-content">
          <div className="vendor-info-header">
            <div>
              <h3 className="vendor-name">{vendor?.businessName || 'Vendor Location'}</h3>
              <p className="vendor-cuisine">{vendor?.cuisineType || ''}</p>
            </div>
            {vendor && (
              <span className={`vendor-status ${vendor.status}`}>
                {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
              </span>
            )}
          </div>
          
          <div className="fullscreen-map-container">
            {vendor ? (
              <div>
                <div className="map-placeholder-icon"></div>
                <h3 className="map-placeholder-title">Coordinates in Map</h3>
                
                {/* Display location information */}
                {vendor.location && vendor.location.coordinates ? (
                  <div>
                    <p className="map-placeholder-coordinates">
                      Coordinates: {vendor.location.coordinates[1].toFixed(6)}, {vendor.location.coordinates[0].toFixed(6)}
                    </p>
                    {vendor.location.accuracy && (
                      <p className="map-placeholder-accuracy">
                        Accuracy: {vendor.location.accuracy.toFixed(0)} meters
                      </p>
                    )}
                    {vendor.officename && (
                      <p><span style={{ fontWeight: '500' }}>Area:</span> {vendor.officename}</p>
                    )}
                  </div>
                ) : (
                  <p className="map-placeholder-coordinates">
                    {vendor.address 
                      ? `${vendor.address}, Pincode: ${vendor.pincode}`
                      : `Location: Pincode ${vendor.pincode}`
                    }
                  </p>
                )}
                
                <div className="vendor-details-card">
                  <h4 className="vendor-details-title">Vendor Information</h4>
                  <div>
                    <div className="vendor-detail-item">
                      <span className="detail-label">Business:</span>
                      <span className="detail-value">{vendor.businessName}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{vendor.phoneNumber}</span>
                    </div>
                    <div className="vendor-detail-item">
                      <span className="detail-label">Pincode:</span>
                      <span className="detail-value">{vendor.pincode}</span>
                    </div>
                    {vendor.address && (
                      <div className="vendor-detail-item">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{vendor.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state-smooth">
                <div className="empty-state-icon"></div>
                <h3 className="empty-state-title">Vendor information not available</h3>
                <p className="empty-state-description">Unable to load vendor location details.</p>
              </div>
            )}
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
                // Copy vendor coordinates link to clipboard
                if (vendor && vendor.location && vendor.location.coordinates) {
                  const lat = vendor.location.coordinates[1];
                  const lng = vendor.location.coordinates[0];
                  const locationLink = `https://www.google.com/maps?q=${lat},${lng}`;
                  
                  navigator.clipboard.writeText(locationLink)
                    .then(() => {
                      alert('Location link copied to clipboard!');
                    })
                    .catch(err => {
                      console.error('Failed to copy location link: ', err);
                      // Fallback: show the link in an alert
                      alert(`Copy this link: ${locationLink}`);
                    });
                } else {
                  alert('Vendor location is not available');
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