import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI } from '../services/api';
import './VendorDashboardStyles.css';

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
              className="btn-vendor"
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
        <header className="vendor-dashboard-card">
          <div className="vendor-section-header" style={{ textAlign: 'center', flexDirection: 'column' }}>
            <div>
              <h1 className="vendor-section-title">Live Location Tracking</h1>
              <p style={{ margin: '0 auto' }}>Share your real-time location with customers</p>
            </div>
            {isTracking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                <span style={{ fontWeight: '500', color: '#10b981' }}>LIVE</span>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        {success && (
          <div style={{ backgroundColor: '#f0f0f0', borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
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

        {error && (
          <div style={{ backgroundColor: '#f0f0f0', borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
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

        {/* Location Controls */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Location Controls</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
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
                className="btn-vendor"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                Start Live Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="btn-vendor"
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                Stop Live Tracking
              </button>
            )}
          </div>

          {/* Location Info */}
          {location.latitude && location.longitude && (
            <div className="vendor-info-grid">
              <div className="vendor-info-item">
                <p><strong>Latitude:</strong> {location.latitude.toFixed(6)}</p>
              </div>
              <div className="vendor-info-item">
                <p><strong>Longitude:</strong> {location.longitude.toFixed(6)}</p>
              </div>
              <div className="vendor-info-item">
                <p><strong>Accuracy:</strong> {location.accuracy ? `${location.accuracy.toFixed(0)} meters` : 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Tracking Status */}
          {isTracking && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse 1.5s infinite' }}></div>
                <strong>LIVE LOCATION IS ON</strong>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#666' }}>
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
          <ul style={{ paddingLeft: '1.5rem', color: '#666' }}>
            <li style={{ marginBottom: '0.5rem' }}>Ensure location services are enabled on your device</li>
            <li style={{ marginBottom: '0.5rem' }}>Use a stable internet connection for faster updates</li>
            <li style={{ marginBottom: '0.5rem' }}>Keep the app open while tracking is active</li>
            <li>Location updates occur every 10 seconds for optimal battery usage</li>
          </ul>
        </div>
      </div>

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

export default VendorLocation;