import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI } from '../../services/api';
import StarRating from '../../components/common/StarRating';
import Footer from '../../components/Footer';

const VendorRatings = () => {
  const { vendorId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorAndRatings();
  }, [vendorId]);

  const fetchVendorAndRatings = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor details
      const vendorResponse = await vendorAPI.getVendorById(vendorId);
      setVendor(vendorResponse.data);
      
      // Fetch ratings
      const ratingsResponse = await vendorAPI.getVendorRatings(vendorId);
      setRatings(ratingsResponse.data);
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch vendor ratings:', err);
      setError('Failed to load vendor ratings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '1rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.125rem', color: '#4b5563' }}>Loading vendor ratings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', padding: '1rem' }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>Vendor Ratings</h1>
            <p style={{ color: '#4b5563' }}>View customer ratings and reviews</p>
            <div style={{ marginTop: '1rem' }}>
              <span style={{ color: '#374151' }}>Welcome, {user?.username || user?.email}</span>
              <button
                onClick={handleLogout}
                style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Back to Vendor Profile */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', color: '#4f46e5', cursor: 'pointer' }}
          >
            <svg style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.25rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Vendor Info */}
        {vendor && (
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#e5e7eb', border: '2px dashed #9ca3af', borderRadius: '0.75rem', width: '4rem', height: '4rem' }} />
              <div style={{ marginLeft: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{vendor.businessName}</h2>
                <p style={{ color: '#4b5563' }}>{vendor.cuisineType}</p>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
                  {vendor.ratings?.average?.toFixed(1) || '0.0'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <StarRating rating={Math.round(vendor.ratings?.average || 0)} interactive={false} showRatingValue={false} />
                  <span style={{ marginLeft: '0.5rem', color: '#4b5563' }}>
                    ({vendor.ratings?.count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ratings List */}
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
            Customer Reviews ({ratings.length})
          </h2>
          
          {ratings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}></div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>No reviews yet</h3>
              <p style={{ color: '#6b7280' }}>This vendor doesn't have any reviews yet.</p>
            </div>
          ) : (
            <div>
              {ratings.map((rating) => (
                <div key={rating._id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontWeight: '500', color: '#1f2937' }}>
                        {rating.customer?.username || rating.customer?.email || 'Anonymous User'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                        <StarRating rating={rating.rating} interactive={false} showRatingValue={false} />
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>{rating.rating}.0</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {formatDate(rating.createdAt)}
                    </span>
                  </div>
                  {rating.review && (
                    <p style={{ marginTop: '0.75rem', color: '#374151' }}>{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VendorRatings;