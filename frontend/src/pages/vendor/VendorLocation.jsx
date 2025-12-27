import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI } from '../../services/api';
import Footer from '../../components/Footer';
import './css/VendorDashboardStyles.css';
import '../../styles/globals.css';
import ErrorMessage from '../../components/common/ErrorMessage';
import Card from '../../components/common/Card';

const VendorLocation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null
  });
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false); // New state for auto-saving
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // Use network-based location instead of GPS for faster results
        timeout: 15000, // Increase timeout to 15 seconds
        maximumAge: 300000 // Accept cached location up to 5 minutes old
      }
    );
  };

  const saveLocation = async () => {
    if (!location.latitude || !location.longitude) {
      setError('No location data to save');
      return;
    }

    try {
      setSaving(true);
      // Only clear success message if not in tracking mode
      if (!isTracking) {
        setSuccess('');
      }
      setError('');
      
      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      };
      
      await vendorAPI.updateLocation(locationData);
      // Only set success message if not in tracking mode
      if (!isTracking) {
        setSuccess('Location saved successfully!');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Failed to save location: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const autoSaveLocation = async (newPosition) => {
    try {
      setAutoSaving(true);
      setError('');
      
      const locationData = {
        latitude: newPosition.latitude,
        longitude: newPosition.longitude,
        accuracy: newPosition.accuracy
      };
      
      await vendorAPI.updateLocation(locationData);
      // Removed success message to avoid duplication - we have the persistent indicator
    } catch (err) {
      console.error('Error auto-saving location:', err);
      setError('Failed to auto-save location: ' + (err.response?.data?.message || err.message));
    } finally {
      setAutoSaving(false);
    }
  };

  const startTracking = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    try {
      // Set vendor status to OPEN when starting live tracking
      await vendorAPI.updateProfile({ status: 'open' });
      setSuccess('Vendor status set to OPEN');
    } catch (err) {
      console.error('Error updating vendor status:', err);
      setError('Failed to update vendor status: ' + (err.response?.data?.message || err.message));
      // Don't stop the process if status update fails, continue with tracking
    }

    setIsTracking(true);
    setError('');

    // Watch position continuously
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setLocation(newPosition);
        
        // Auto-save to database every 10 seconds
        if (!window.lastAutoSave || Date.now() - window.lastAutoSave > 10000) {
          autoSaveLocation(newPosition);
          window.lastAutoSave = Date.now();
        }
      },
      (err) => {
        setError(`Error tracking location: ${err.message}`);
        // Don't stop tracking on a single error, continue trying
        console.error('Location tracking error:', err);
      },
      {
        enableHighAccuracy: false, // Use network-based location instead of GPS for faster results
        timeout: 15000, // Increase timeout to 15 seconds
        maximumAge: 300000 // Accept cached location up to 5 minutes old
      }
    );

    // Store watchId to stop tracking later
    window.vendorWatchId = watchId;
    
    // Reset last auto-save timestamp
    window.lastAutoSave = null;
  };

  const stopTracking = () => {
    if (window.vendorWatchId) {
      navigator.geolocation.clearWatch(window.vendorWatchId);
      window.vendorWatchId = null;
    }
    // Clear auto-save timestamp
    window.lastAutoSave = null;
    setIsTracking(false);
  };

  useEffect(() => {
    // Get initial location
    getLocation();
    
    // Cleanup on unmount
    return () => {
      if (window.vendorWatchId) {
        navigator.geolocation.clearWatch(window.vendorWatchId);
      }
      // Clear auto-save timestamp
      window.lastAutoSave = null;
    };
  }, []);

  return (
    <div className="vendor-dashboard">
      {/* Navigation Bar */}
      <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem', borderBottom: '1px solid #000000' }}>
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
              className="btn-vendor active"
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
        {/* Header */}
        <Card variant="dashboard" className="vendor-location-header">
          <div className="vendor-section-header vendor-location-header-content">
            <div className="vendor-location-title-container">
              <h1 className="vendor-section-title">Live Location Tracking</h1>
              <p className="vendor-location-subtitle">Share your real-time location with customers</p>
            </div>
            {isTracking && (
              <div className="live-indicator">
                <div className="live-indicator-dot"></div>
                <span className="live-indicator-text">LIVE</span>
              </div>
            )}
          </div>
        </Card>

        {/* Messages */}
        {success && (
          <div className="vendor-location-message success">
            <div className="vendor-location-message-content">
              <div className="vendor-location-message-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="vendor-location-message-text">
                <p>{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <ErrorMessage message={error} />
        )}

        {/* Location Controls */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Location Controls</h2>
          </div>
          
          <div className="vendor-location-controls">
            <button
              onClick={getLocation}
              disabled={loading || saving || autoSaving}
              className="btn-vendor"
            >
              {loading ? 'Getting Location...' : 'Get Current Location'}
            </button>
            
            {location.latitude && location.longitude && (
              <button
                onClick={saveLocation}
                disabled={saving || autoSaving}
                className="btn-vendor secondary"
              >
                {saving ? 'Saving...' : 'Save Location'}
              </button>
            )}
            
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="btn-vendor start-tracking"
              >
                Start Live Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="btn-vendor stop-tracking"
              >
                Stop Live Tracking
              </button>
            )}
          </div>

          {/* Location Info */}
          {location.latitude && location.longitude && (
            <div className="vendor-info-grid vendor-location-info">
              <div className="vendor-info-item">
                <h3 className="vendor-info-item-title">Latitude</h3>
                <p className="vendor-info-item-value">{location.latitude.toFixed(6)}</p>
              </div>
              <div className="vendor-info-item">
                <h3 className="vendor-info-item-title">Longitude</h3>
                <p className="vendor-info-item-value">{location.longitude.toFixed(6)}</p>
              </div>
              <div className="vendor-info-item">
                <h3 className="vendor-info-item-title">Accuracy</h3>
                <p className="vendor-info-item-value">{location.accuracy ? `${location.accuracy.toFixed(0)} meters` : 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Tracking Status */}
          {isTracking && (
            <div className="vendor-tracking-status">
              <div className="vendor-tracking-status-header">
                <div className="vendor-tracking-status-dot"></div>
                <strong className="vendor-tracking-status-title">LIVE LOCATION IS ON</strong>
              </div>
              <p className="vendor-tracking-status-text">
                Your location is being updated every 10 seconds. Customers can see your real-time location.
              </p>
            </div>
          )}
        </div>

        {/* Location Tips */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Tips for Better Location Accuracy</h2>
          </div>
          <ul className="vendor-location-tips">
            <li className="vendor-location-tip">Ensure location services are enabled on your device</li>
            <li className="vendor-location-tip">Use a stable internet connection for faster updates</li>
            <li className="vendor-location-tip">Keep the app open while tracking is active</li>
            <li className="vendor-location-tip">Location updates occur every 10 seconds for optimal battery usage</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VendorLocation;