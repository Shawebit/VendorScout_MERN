import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VendorComments from '../../components/VendorComments';
import { vendorAPI } from '../../services/api';
import Footer from '../../components/Footer';
import './css/VendorDashboardStyles.css';
import '../../styles/globals.css';

const VendorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vendorProfile, setVendorProfile] = useState(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    // Update time every minute to show session is active
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Fetch vendor profile when component mounts
  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await vendorAPI.getProfile();
      setVendorProfile(response.data);
      
      // Fetch follower count
      try {
        const followerResponse = await vendorAPI.getVendorFollowerCount(response.data._id);
        setFollowerCount(followerResponse.data.followerCount);
      } catch (followerErr) {
        console.error('Failed to fetch follower count:', followerErr);
        setFollowerCount(0);
      }
      
      setProfileError('');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfileError('Failed to load profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="vendor-dashboard">
      {/* Navigation Bar */}
      <nav className="vendor-navbar">
        <div className="vendor-navbar-container">
          <h1 onClick={() => navigate('/vendor/dashboard')} className="vendor-navbar-logo">VendorScout</h1>
          <div className="vendor-navbar-menu">
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
              className="btn-vendor secondary"
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
        {/* Header with logout button */}
        <header className="vendor-dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="vendor-section-title">Dashboard</h1>
              <p>Welcome back, {user?.username || user?.email}</p>
            </div>
            {vendorProfile && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#000', fontSize: '1rem' }}>Status:</span>
                  <span className={`status-badge ${vendorProfile.status}`}>
                    {vendorProfile.status?.charAt(0).toUpperCase() + vendorProfile.status?.slice(1) || 'Open'}
                  </span>
                </div>
                <p style={{ margin: '0.25rem 0', fontSize: '1rem', color: '#000' }}><span style={{ fontWeight: 'bold' }}>Phone:</span> {vendorProfile.phoneNumber}</p>
                <p style={{ margin: '0.25rem 0', fontSize: '1rem', color: '#000' }}><span style={{ fontWeight: 'bold' }}>Pincode:</span> {vendorProfile.pincode}</p>
              </div>
            )}
          </div>
        </header>



        {/* Dashboard Content */}
        <div className="vendor-dashboard-card">
          {/* Rating and Followers Display */}
          <div className="rating-followers-display">
            <div className="metric-card">
              <div className="metric-value">{vendorProfile?.ratings?.average ? vendorProfile.ratings.average.toFixed(1) : '0.0'}</div>
              <div className="metric-label">Average Rating</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{followerCount}</div>
              <div className="metric-label">Followers</div>
            </div>
          </div>
          
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Quick Actions</h2>
          </div>
          <div className="action-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', width: '100%' }}>
            <div 
              onClick={() => navigate('/vendor/profile')}
              className="action-card"
              style={{ minHeight: '200px' }}
            >
              <div className="action-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="action-card-title">Profile</h3>
              <p className="action-card-description">Manage your vendor information</p>
            </div>
            <div 
              onClick={() => navigate('/vendor/menu')}
              className="action-card"
              style={{ minHeight: '200px' }}
            >
              <div className="action-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10h18V5H3v5zM3 19h18v-5H3v5z"></path>
                  <path d="M8 5V3m8 2V3"></path>
                </svg>
              </div>
              <h3 className="action-card-title">Menu</h3>
              <p className="action-card-description">Manage your food items and pricing</p>
            </div>
            <div 
              onClick={() => navigate('/vendor/location')}
              className="action-card"
              style={{ minHeight: '200px' }}
            >
              <div className="action-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 className="action-card-title">Location</h3>
              <p className="action-card-description">Update your live location</p>
            </div>
            <div 
              onClick={() => navigate('/vendor/broadcast')}
              className="action-card"
              style={{ minHeight: '200px' }}
            >
              <div className="action-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h8M4 18V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path>
                  <path d="M14 16l4-4-4-4"></path>
                </svg>
              </div>
              <h3 className="action-card-title">Broadcast</h3>
              <p className="action-card-description">Send messages to your followers</p>
            </div>
            <div 
              onClick={() => navigate('/vendor/discussions')}
              className="action-card"
              style={{ minHeight: '200px' }}
            >
              <div className="action-card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="action-card-title">Discussions</h3>
              <p className="action-card-description">View customer discussions</p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Customer Reviews</h2>
          </div>
          {profileLoading ? (
            <div className="empty-state-vendor">
              <div></div>
              <p>Loading vendor profile...</p>
            </div>
          ) : profileError ? (
            <div className="empty-state-vendor">
              <div></div>
              <p>Error: {profileError}</p>
            </div>
          ) : vendorProfile ? (
            <VendorComments vendorId={vendorProfile._id} currentUser={user} vendorPincode={vendorProfile.pincode} />
          ) : (
            <div className="empty-state-vendor">
              <div></div>
              <p>No vendor profile found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VendorDashboard;