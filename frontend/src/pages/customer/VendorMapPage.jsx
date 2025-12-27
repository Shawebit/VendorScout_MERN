import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, userAPI } from '../../services/api';
import VendorMap from "../../components/VendorMap";
import CustomerFooter from '../../components/CustomerFooter';
import './css/CustomerDashboardStyles.css';

const VendorMapPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  // Fetch vendors from the database when component mounts
  useEffect(() => {
    fetchVendors();
    
    // Set up auto-refresh every 10 minutes (600000 milliseconds) for map updates
    const intervalId = setInterval(() => {
      fetchVendors();
    }, 600000);
    
    // Clean up interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getAllVendors();
      setVendors(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again.');
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
            <h1 onClick={() => navigate('/customer/dashboard')} className="navbar-logo">
              VendorScout
            </h1>
          </div>

          <div className="navbar-right">
            <button onClick={() => navigate('/customer/map')} className="nav-link active">
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

      {/* Main map container */}
      <div className="customer-dashboard-container">
        {/* Map header */}
        <header className="dashboard-header">
          <h2 className="dashboard-title">Real-Time Vendor Locations</h2>
          <p className="dashboard-subtitle">Track vendors in real-time on the map</p>
        </header>

        {/* Error message */}
        {error && (
          <section className="error-banner">
            <div className="error-content">
              <span className="error-text">{error}</span>
            </div>
          </section>
        )}

        {/* Loading indicator */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading map data...</p>
          </div>
        )}

        {/* Map section */}
        {!loading && (
          <section className="vendors-grid-section" style={{ padding: 0 }}>
            <VendorMap vendors={vendors} />
          </section>
        )}
      </div>
      <CustomerFooter />
    </div>
  );
};

export default VendorMapPage;