import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, commentAPI, userAPI } from '../services/api';
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

const FollowedVendors = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  useEffect(() => {
    fetchVendors();
  }, []);



  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getFollowedVendors();
      setVendors(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch followed vendors:', err);
      setError('Failed to load followed vendors');
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

  // Function to select a vendor for detailed view
  const handleSelectVendor = (vendor) => {
    // Navigate to the dedicated vendor detail page instead of showing embedded details
    navigate(`/customer/followed/vendor/${vendor._id}`);
  };

  // Format vendor data for display
  const formatVendorData = (vendor) => {
    return {
      id: vendor._id,
      name: vendor.businessName,
      cuisine: vendor.cuisineType,
      rating: vendor.ratings?.average || 0,
      status: vendor.status || 'open',
      image: vendor.images && vendor.images.length > 0 
        ? vendor.images[0].url 
        : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E`,
      pincode: vendor.pincode,
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

  if (loading) {
    return (
      <div>
        <div>
          <div>
            <div></div>
            <p>Loading followed vendors...</p>
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

      {/* Main container */}
      <div style={{ padding: '1rem' }}>
        {/* Header */}
        <header className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Followed Vendors</h2>
            <p>View and manage your followed vendors</p>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <section className="dashboard-card" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <div>
              {error}
            </div>
          </section>
        )}



        {/* Vendor Listings */}
          <section className="dashboard-card">
            <div>
              <div className="vendor-list-header">
                <h3 className="section-title">{vendors.length} Vendors</h3>
              </div>
              
              {vendors.length === 0 ? (
                <div className="empty-state-smooth">
                  <div></div>
                  <h4 className="no-followed-vendors-title">No followed vendors</h4>
                  <p className="no-followed-vendors-text">You haven't followed any vendors yet.</p>
                  <button onClick={() => navigate('/customer/dashboard')} className="btn-smooth">
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div className="vendors-grid">
                  {vendors.map((vendor) => {
                    const formattedVendor = formatVendorData(vendor);
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
      </div>
      <CustomerFooter />
    </div>
  );
};

export default FollowedVendors;