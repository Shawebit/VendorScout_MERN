import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, userAPI } from '../services/api';
import CustomerFooter from '../components/CustomerFooter';
import './CustomerDashboardStyles.css';

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
      <div>
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
              <button onClick={() => navigate('/customer/followed')} className="btn-smooth secondary">
                Followed Vendors
              </button>
              <button onClick={() => navigate('/customer/discussion')} className="btn-smooth secondary">
                Community
              </button>
              <button onClick={handleLogout} className="btn-smooth secondary">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div style={{ padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.125rem' }}>Loading broadcast messages...</div>
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
            <button onClick={() => navigate('/customer/followed')} className="btn-smooth secondary">
              Followed Vendors
            </button>
            <button onClick={() => navigate('/customer/discussion')} className="btn-smooth secondary">
              Community
            </button>
            <button onClick={handleLogout} className="btn-smooth secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '1rem' }}>
        {/* Header - REMOVED DUPLICATE BROADCAST MESSAGES HEADING */}
        <header className="dashboard-card">
          <div className="vendor-broadcast-header">
            <h1 className="section-title">Broadcast Messages</h1>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="dashboard-card broadcast-error-message">
            {error}
          </div>
        )}

        {/* Broadcast Messages - SHOW MESSAGES ONLY ONCE */}
        <div className="broadcast-messages-container">
          {messages.length === 0 ? (
            <div className="empty-state-smooth">
              <div className="broadcast-emoji"></div>
              <h3 className="broadcast-empty-title">No broadcast messages</h3>
              <p className="broadcast-empty-text">This vendor hasn't sent any broadcast messages yet.</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <div key={message._id} className="broadcast-message-card">
                  <div className="broadcast-message-content">
                    <p className="broadcast-message-text">{message.content}</p>
                    <span className="broadcast-message-date">
                      {formatDate(message.sentAt || message.createdAt)}
                    </span>
                  </div>
                  <div className="broadcast-message-meta">
                    <span className="broadcast-message-recipients">
                      Sent to {message.recipients || 0} followers
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CustomerFooter />
    </div>
  );
};

export default VendorBroadcastMessages;