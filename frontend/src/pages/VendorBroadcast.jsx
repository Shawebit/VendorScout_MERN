import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI } from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

const VendorBroadcast = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [message, setMessage] = useState('');
  const [followers, setFollowers] = useState(120); // Mock follower count
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);

  // Fetch broadcast messages when component mounts
  useEffect(() => {
    fetchBroadcastMessages();
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const response = await vendorAPI.getProfile();
      setVendorProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch vendor profile:', err);
    }
  };

  const fetchBroadcastMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorAPI.getBroadcastMessages();
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch broadcast messages:', err);
      setError('Failed to load broadcast messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Prepare message data
      const messageData = {
        content: message
      };
      
      // Send message to backend
      await vendorAPI.sendBroadcastMessage(messageData);
      
      // Show success feedback
      setSuccess('Message sent to all followers!');
      
      // Clear form
      setMessage('');
      
      // Refresh messages
      await fetchBroadcastMessages();
    } catch (err) {
      console.error('Failed to send broadcast message:', err);
      setError('Failed to send broadcast message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // Set the message to delete and show the modal
    setMessageToDelete(messageId);
    setShowDeleteModal(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await vendorAPI.deleteBroadcastMessage(messageToDelete);
      setSuccess('Message deleted successfully!');
      
      // Refresh messages
      await fetchBroadcastMessages();
    } catch (err) {
      console.error('Failed to delete broadcast message:', err);
      setError('Failed to delete broadcast message. Please try again.');
    } finally {
      setLoading(false);
      setMessageToDelete(null);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="vendor-dashboard">
      {/* Navigation Bar */}
      <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 onClick={() => navigate('/vendor/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate('/vendor/profile')}
              className="btn-vendor secondary"
            >
              Profile
            </button>
            <button 
              onClick={() => navigate('/vendor/menu')}
              className="btn-vendor secondary"
            >
              Menu
            </button>
            <button 
              onClick={() => navigate('/vendor/location')}
              className="btn-vendor secondary"
            >
              Location
            </button>
            <button 
              onClick={() => navigate('/vendor/broadcast')}
              className="btn-vendor"
            >
              Broadcast
            </button>
            <button 
              onClick={() => navigate('/vendor/discussions')}
              className="btn-vendor secondary"
            >
              Discussions
            </button>
            <button 
              onClick={handleLogout}
              className="btn-vendor"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="vendor-dashboard-container">
        {/* Header */}
        <header className="vendor-dashboard-card">
          <div style={{ textAlign: 'center' }}>
            <h1 className="vendor-section-title">Broadcast Messages</h1>
            <p className="vendor-section-subtitle">Send updates to your followers</p>
          </div>
        </header>

        {/* Success message */}
        {success && (
          <div className="vendor-dashboard-card" style={{ borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flexShrink: 0 }}>
                <svg style={{ height: '1.25rem', width: '1.25rem', color: '#000' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#000' }}>
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="vendor-dashboard-card" style={{ borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ flexShrink: 0 }}>
                <svg style={{ height: '1.25rem', width: '1.25rem', color: '#000' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div style={{ marginLeft: '0.75rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#000' }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Send Message Card */}
        <div className="vendor-dashboard-card">
          <h2 className="vendor-section-title">Send New Broadcast</h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="form-input"
              placeholder="Tell your followers about specials, location changes, or other updates..."
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem' }}>
                {message.length}/280 characters
              </span>
              <span style={{ fontSize: '0.875rem' }}>
                {followers} followers
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || loading}
              className="btn-vendor"
              style={{ width: '100%', opacity: message.trim() && !loading ? 1 : 0.5 }}
            >
              {loading ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>

        {/* Previous Messages */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Previous Broadcasts</h2>
            <span style={{ fontSize: '0.875rem' }}>
              {messages.length} messages
            </span>
          </div>
          
          {messages.length === 0 ? (
            <div className="empty-state-vendor">
              <div></div>
              <h3 className="no-vendors-title">No broadcast messages yet</h3>
              <p>Send your first broadcast message to your followers</p>
            </div>
          ) : (
            <div>
              {messages.map((msg) => (
                <div key={msg._id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{msg.content}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-medium-grey)' }}>{formatTimestamp(msg.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="btn-vendor secondary"
                      style={{ padding: '0.25rem' }}
                    >
                      <svg style={{ width: '1rem', height: '1rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setMessageToDelete(null);
        }}
        onConfirm={confirmDeleteMessage}
        title="Delete Broadcast Message"
        message="Are you sure you want to delete this broadcast message? This action cannot be undone."
        confirmText="Delete"
        confirmButtonStyle="danger"
      />

      {/* Footer */}
      <footer style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 -2px 4px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
        <div style={{ textAlign: 'center', color: '#000' }}>
          <p>&copy; 2025 VendorScout. All rights reserved.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <a href="#" style={{ color: '#000', textDecoration: 'underline' }}>About Us</a>
            <a href="#" style={{ color: '#000', textDecoration: 'underline' }}>Contact</a>
            <a href="#" style={{ color: '#000', textDecoration: 'underline' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#000', textDecoration: 'underline' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorBroadcast;