import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { vendorAPI } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import Footer from '../../components/Footer';
import './css/VendorDashboardStyles.css';
import '../../styles/globals.css';

const VendorMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    imageUrl: ''
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await vendorAPI.getMenuItems();
      setMenuItems(response.data);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isAvailable: true,
      imageUrl: ''
    });
    setIsAdding(false);
    setEditingItem(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.price) {
      setError('Name and price are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Convert price to number
      const menuItemData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      if (editingItem) {
        // Update existing menu item
        await vendorAPI.updateMenuItem(editingItem._id, menuItemData);
        setSuccess('Menu item updated successfully!');
      } else {
        // Add new menu item
        await vendorAPI.addMenuItem(menuItemData);
        setSuccess('Menu item added successfully!');
      }
      
      // Refresh the menu items
      await fetchMenuItems();
      resetForm();
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setError('Failed to save menu item: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl || ''
    });
    setEditingItem(item);
    setIsAdding(true);
    setError('');
    setSuccess('');
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = async (itemId) => {
    // Set the item to delete and show the modal
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await vendorAPI.deleteMenuItem(itemToDelete);
      setSuccess('Menu item deleted successfully!');
      await fetchMenuItems();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError('Failed to delete menu item: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  const startAddNewItem = () => {
    resetForm();
    setIsAdding(true);
  };

  if (loading && menuItems.length === 0) {
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
                className="btn-vendor"
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
          <div className="vendor-dashboard-card text-center">
            <div className="empty-state-vendor">
              <div></div>
              <p>Loading menu items...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              className="btn-vendor"
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
        {/* Header */}
        <header className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <div>
              <h1 className="vendor-section-title">Menu Management</h1>
              <p>Manage your food items and pricing</p>
            </div>
            <button 
              onClick={startAddNewItem}
              className="btn-vendor"
            >
              Add New Item
            </button>
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
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

        {/* Add/Edit Form */}
        {(isAdding || editingItem) && (
          <div className="vendor-dashboard-card">
            <div className="vendor-section-header">
              <h2 className="vendor-section-title">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input-vendor"
                    required
                  />
                </div>
                
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input-vendor"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-input-vendor"
                  rows="3"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-input-vendor"
                  />
                </div>
                
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="form-input-vendor"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleInputChange}
                  />
                  <span>Available for Order</span>
                </label>
              </div>

              <div style={{ paddingTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-vendor"
                  style={{ marginRight: '0.75rem' }}
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-vendor secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="vendor-dashboard-card">
          <div className="vendor-section-header">
            <h2 className="vendor-section-title">Current Menu Items</h2>
          </div>
          
          {menuItems.length === 0 ? (
            <div className="empty-state-vendor">
              <div></div>
              <h3 className="no-comments-title">No menu items yet</h3>
              <p>Add your first menu item to get started</p>
              <button 
                onClick={startAddNewItem}
                className="btn-vendor"
                style={{ marginTop: '1rem' }}
              >
                Add Menu Item
              </button>
            </div>
          ) : (
            <div className="vendor-menu-items-grid">
              {menuItems.map((item) => (
                <div key={item._id} className="vendor-menu-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 0.5rem' }}>{item.name}</h3>
                    <span className={`vendor-availability ${!item.isAvailable ? 'not-available' : ''}`}>
                      {item.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p style={{ margin: '0 0 1rem', color: '#666', fontSize: '0.875rem' }}>{item.description}</p>
                  )}
                  
                  {item.category && (
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem' }}><strong>Category:</strong> {item.category}</p>
                  )}
                  
                  {item.imageUrl && (
                    <div style={{ margin: '0.5rem 0' }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                  
                  <div className="vendor-menu-item-footer">
                    <span className="vendor-menu-item-price">₹{item.price}</span>
                    <div>
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn-vendor secondary"
                        style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="btn-vendor"
                        style={{ padding: '0.25rem 0.75rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteItem}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default VendorMenu;