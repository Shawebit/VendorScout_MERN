import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, userAPI } from '../services/api';
import VendorMap from "../components/VendorMap";
import CustomerFooter from '../components/CustomerFooter';
import './CustomerDashboardStyles.css';

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

      {/* Main map container */}
      <div style={{ padding: '1rem' }}>
        {/* Map header */}
        <header className="dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Real-Time Vendor Locations</h2>
            <p>Track vendors in real-time on the map</p>
          </div>
        </header>

        {/* Error message section */}
        {error && (
          <section className="dashboard-card" style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c' }}>
            <div>
              {error}
            </div>
          </section>
        )}

        {/* Loading indicator section */}
        {loading && (
          <section className="dashboard-card empty-state-smooth">
            <div>
              <div></div>
              <p>Loading map data...</p>
            </div>
          </section>
        )}

        {/* Map section */}
        <section className="dashboard-card">
          <div className="map-container-smooth">
            {!loading && !error && (
              <VendorMap vendors={vendors} />
            )}
          </div>
        </section>
      </div>
      <CustomerFooter />
    </div>
  );
};

export default VendorMapPage;