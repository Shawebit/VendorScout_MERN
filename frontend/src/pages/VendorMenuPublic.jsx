import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, userAPI } from '../services/api';
import CustomerFooter from '../components/CustomerFooter';

const VendorMenuPublic = () => {
  const { vendorId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for pincode input in navbar
  const [pincodeInput, setPincodeInput] = useState(user?.pincode || '');

  useEffect(() => {
    if (vendorId) {
      fetchVendorMenu();
      fetchVendorDetails();
    }
  }, [vendorId]);

  const fetchVendorMenu = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getMenuItemsByVendor(vendorId);
      setMenuItems(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items');
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

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

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
                  style={{ padding: '0.5rem', border: '1px solid #000', borderRadius: '4px', width: '100px' }}
                />
                <button 
                  onClick={handlePincodeSearch} 
                  style={{ padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {/* Location pin icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/customer/map')}>
                Live Map
              </button>
              <button onClick={() => navigate('/customer/discussion')}>
                Community Discussions
              </button>
              <button onClick={() => navigate('/customer/followed')}>
                Followed Vendors
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div style={{ padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.125rem' }}>Loading vendor menu...</div>
          </div>
        </div>
      </div>
    );
  }

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
                style={{ padding: '0.5rem', border: '1px solid #000', borderRadius: '4px', width: '100px' }}
              />
              <button 
                onClick={handlePincodeSearch} 
                style={{ padding: '0.5rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {/* Location pin icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => navigate('/customer/map')}>
              Live Map
            </button>
            <button onClick={() => navigate('/customer/discussion')}>
              Community Discussions
            </button>
            <button onClick={() => navigate('/customer/followed')}>
              Followed Vendors
            </button>
            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ padding: '1rem' }}>
        {/* Header */}
        <header style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Vendor Menu</h1>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#f0f0f0', borderLeft: '4px solid #000', padding: '1rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Back to Dashboard */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/customer/dashboard')}
            style={{ display: 'flex', alignItems: 'center', color: '#000', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <svg style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.25rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Vendor Info */}
        {vendor && (
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{vendor.businessName}</h2>
                <p style={{ marginTop: '0.25rem' }}>{vendor.cuisineType}</p>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', 
                    backgroundColor: '#f0f0f0',
                    color: '#000'
                  }}>
                    {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1) || 'Open'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        {menuItems.length === 0 ? (
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}></div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.25rem' }}>No menu items available</h3>
            <p>This vendor hasn't added any menu items yet.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Menu Items</h2>
            
            {Object.keys(groupedMenuItems).map(category => (
              <div key={category} style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #000' }}>
                  {category}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                  {groupedMenuItems[category].map(item => (
                    <div key={item._id} style={{ border: '1px solid #000', borderRadius: '4px', overflow: 'hidden' }}>
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        />
                      )}
                      <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontWeight: '500' }}>{item.name}</h4>
                          <span style={{ fontWeight: 'bold' }}>₹{item.price}</span>
                        </div>
                        
                        {item.description && (
                          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>{item.description}</p>
                        )}
                        
                        <div style={{ marginTop: '0.75rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', 
                            backgroundColor: item.isAvailable ? '#f0f0f0' : '#f0f0f0',
                            color: '#000'
                          }}>
                            {item.isAvailable ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <CustomerFooter />
      </div>
    </div>
  );
};

export default VendorMenuPublic;