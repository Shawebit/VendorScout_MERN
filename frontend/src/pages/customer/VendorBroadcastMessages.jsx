import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI, userAPI } from '../../services/api';
import CustomerFooter from '../../components/CustomerFooter';
import './css/CustomerDashboardStyles.css';

const VendorBroadcastMessages = () => {
  const { vendorId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  useEffect(() => {
    if (vendorId) {
      fetchBroadcastMessages();
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchBroadcastMessages = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getBroadcastMessagesByVendor(vendorId);
      setMessages(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch broadcast messages:', err);
      setError('Failed to load broadcast messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetails = async () => {
    try {
      const response = await vendorAPI.getVendorById(vendorId);
      setVendor(response.data);
    } catch (err) {
      console.error('Failed to fetch vendor details:', err);
      setError('Failed to load vendor details');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
                  disabled
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

        <div className="customer-dashboard-container">
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading broadcast messages...</p>
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

      <div className="customer-dashboard-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header */}
        <header style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="dashboard-title" style={{ marginBottom: '0.5rem', textAlign: 'left' }}>Broadcast Messages</h2>
              {vendor && (
                <p style={{ fontSize: '0.875rem', color: '#666666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{vendor.businessName}</p>
              )}
            </div>
            <button onClick={() => navigate(`/customer/vendor/${vendorId}`)} className="nav-link logout-link" style={{ padding: '0.875rem 2rem' }}>
              Back to Vendor
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem', border: '1px solid #ff0000', backgroundColor: '#fff5f5' }}>
            <p style={{ fontSize: '0.875rem', color: '#ff0000', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{error}</p>
          </div>
        )}

        {/* Broadcast Messages */}
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', color: '#000000' }}>No Broadcasts Yet</h3>
            <p style={{ fontSize: '0.875rem', color: '#666666' }}>This vendor hasn't sent any messages</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {messages.map((message) => (
              <div key={message._id} style={{ border: '1px solid #e5e5e5', padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {formatDate(message.sentAt || message.createdAt)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                      {message.recipients || 0} Recipients
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#000000', lineHeight: '1.7' }}>{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <CustomerFooter />
    </div>
  );
};

export default VendorBroadcastMessages;