import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, commentAPI, userAPI } from '../../services/api';
import VendorCard from '../../components/VendorCard';
import CustomerFooter from '../../components/CustomerFooter';
import './css/CustomerDashboardStyles.css';
import StarRating from '../../components/common/StarRating';

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
        <nav className="customer-navbar">
          <div className="customer-navbar-container">
            <div className="navbar-left">
              <div className="pincode-search-container">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  disabled
                  className="pincode-input"
                />
                <button className="pincode-btn" disabled aria-label="Search pincode">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="navbar-center">
              <h1 className="navbar-logo">VendorScout</h1>
            </div>
            <div className="navbar-right">
              <button className="nav-link" disabled>Live Map</button>
              <button className="nav-link" disabled>Community</button>
              <button className="nav-link active" disabled>Followed</button>
              <button className="nav-link logout-link" disabled>Logout</button>
            </div>
          </div>
        </nav>
        <div className="customer-dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading followed vendors...</p>
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
              <button 
                onClick={handlePincodeSearch} 
                className="pincode-btn"
                aria-label="Search pincode"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="navbar-center">
            <h1 className="navbar-logo" onClick={() => navigate('/customer/dashboard')}>VendorScout</h1>
          </div>
          
          <div className="navbar-right">
            <button onClick={() => navigate('/customer/map')} className="nav-link">
              Live Map
            </button>
            <button onClick={() => navigate('/customer/discussion')} className="nav-link">
              Community
            </button>
            <button onClick={() => navigate('/customer/followed')} className="nav-link active">
              Followed
            </button>
            <button onClick={handleLogout} className="nav-link logout-link">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main container */}
      <div className="customer-dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h2 className="dashboard-title">Followed Vendors</h2>
          <p className="dashboard-subtitle">View and manage your followed vendors</p>
        </header>

        {/* Error Message */}
        {error && (
          <section className="error-banner">
            <div className="error-content">
              <span className="error-text">{error}</span>
            </div>
          </section>
        )}



        {/* Vendor Listings */}
        <section className="vendors-section">
          {vendors.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-state-title">No Followed Vendors</h3>
              <p className="empty-state-text">You haven't followed any vendors yet. Start exploring and follow your favorite vendors!</p>
              <button onClick={() => navigate('/customer/dashboard')} className="btn-smooth">
                Explore Vendors
              </button>
            </div>
          ) : (
            <>
              {/* Vendors Header */}
              <div className="vendors-header">
                <h3 className="vendors-count">
                  {vendors.length} {vendors.length === 1 ? 'Vendor' : 'Vendors'}
                </h3>
              </div>

              {/* Vendors Grid */}
              <div className="vendors-grid">
                {vendors.map((vendor) => (
                  <VendorCard 
                    key={vendor._id} 
                    vendor={vendor} 
                    onSelectVendor={handleSelectVendor} 
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
      <CustomerFooter />
    </div>
  );
};

export default FollowedVendors;