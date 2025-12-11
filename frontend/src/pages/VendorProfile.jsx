import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vendorAPI, commentAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { uploadImages } from '../utils/imageUpload';
import './VendorDashboardStyles.css';

const VendorProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: '',
    cuisineType: '',
    description: '',
    phoneNumber: '',
    pincode: '',
    address: '',
    status: 'closed',
    images: []
  });
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState('');

  // Fetch vendor profile when component mounts
  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getProfile();
      setProfileData(response.data);
      
      // Fetch follower count
      try {
        const followerResponse = await vendorAPI.getVendorFollowerCount(response.data._id);
        setFollowerCount(followerResponse.data.followerCount);
      } catch (followerErr) {
        console.error('Failed to fetch follower count:', followerErr);
        setFollowerCount(0);
      }
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to summarize vendor comments in max 2 lines
  const summarizeComments = async () => {
    try {
      setSummarizing(true);
      setSummary('');
      setError('');
      
      // Fetch comments for summarization
      const response = await commentAPI.getVendorCommentsSummary();
      
      if (response.data.count === 0) {
        setSummary("No comments yet. Encourage customers to share feedback!");
        return;
      }
      
      // Enhanced analysis algorithm
      const comments = response.data.comments;
      
      // 1. Sentiment Analysis
      const positiveWords = [
        'good', 'great', 'excellent', 'amazing', 'delicious', 'tasty', 'awesome', 'love', 'best',
        'fantastic', 'wonderful', 'perfect', 'outstanding', 'superb', 'brilliant', 'impressive',
        'satisfied', 'happy', 'pleased', 'recommend', 'must-try', 'yum', 'yummy', 'nice'
      ];
      
      const negativeWords = [
        'bad', 'terrible', 'awful', 'worst', 'disappointing', 'horrible', 'poor', 'disgusting',
        'hate', 'worst', 'mediocre', 'bland', 'overpriced', 'slow', 'rude', 'dirty', 'cold',
        'stale', 'greasy', 'undercooked', 'overcooked', 'unhygienic', 'expensive', 'worst'
      ];
      
      const serviceWords = [
        'service', 'staff', 'friendly', 'quick', 'fast', 'slow', 'rude', 'polite', 'attentive',
        'helpful', 'professional', 'efficient', 'courteous', 'responsive', 'supportive', 'prompt',
        'wait', 'waiting', 'queue', 'timing', 'delivery', 'served', 'server', 'person'
      ];
      
      const foodQualityWords = [
        'food', 'taste', 'flavor', 'spicy', 'sweet', 'sour', 'fresh', 'quality', 'portion',
        'size', 'quantity', 'variety', 'authentic', 'spices', 'ingredients', 'recipe',
        'presentation', 'appearance', 'hot', 'temperature', 'texture', 'crispy', 'dish'
      ];
      
      // Initialize counters
      let positiveScore = 0;
      let negativeScore = 0;
      let serviceMentions = 0;
      let foodMentions = 0;
      
      // Process each comment
      comments.forEach(comment => {
        const lowerComment = comment.toLowerCase();
        
        // Count positive words
        positiveWords.forEach(word => {
          const regex = new RegExp('\\b' + word + '\\b', 'gi');
          const matches = lowerComment.match(regex);
          positiveScore += matches ? matches.length : 0;
        });
        
        // Count negative words
        negativeWords.forEach(word => {
          const regex = new RegExp('\\b' + word + '\\b', 'gi');
          const matches = lowerComment.match(regex);
          negativeScore += matches ? matches.length : 0;
        });
        
        // Count service mentions
        serviceWords.forEach(word => {
          const regex = new RegExp('\\b' + word + '\\b', 'gi');
          const matches = lowerComment.match(regex);
          serviceMentions += matches ? matches.length : 0;
        });
        
        // Count food quality mentions
        foodQualityWords.forEach(word => {
          const regex = new RegExp('\\b' + word + '\\b', 'gi');
          const matches = lowerComment.match(regex);
          foodMentions += matches ? matches.length : 0;
        });
      });
      
      // Generate 2-line human-like summary
      const summaryLines = [];
      
      // Line 1: Sentiment summary
      const totalSentimentWords = positiveScore + negativeScore;
      if (totalSentimentWords > 0) {
        if (positiveScore > negativeScore * 2) {
          summaryLines.push("Customers love your food! Positive feedback dominates.");
        } else if (positiveScore > negativeScore) {
          summaryLines.push("Most feedback is positive. Customers are generally happy.");
        } else if (negativeScore > positiveScore * 2) {
          summaryLines.push("Some concerns in feedback. Opportunity to improve customer experience.");
        } else {
          summaryLines.push("Mixed feedback. Balanced views on your offerings.");
        }
      } else {
        summaryLines.push("Neutral feedback. Customers sharing straightforward experiences.");
      }
      
      // Line 2: Focus area
      if (foodMentions > serviceMentions * 1.5) {
        summaryLines.push("Food quality is your highlight - keep up the great taste!");
      } else if (serviceMentions > foodMentions * 1.5) {
        summaryLines.push("Your service impresses - customers notice your team's efforts.");
      } else if (foodMentions > 0 || serviceMentions > 0) {
        summaryLines.push("Balanced mentions of food and service. Both matter to customers.");
      } else {
        summaryLines.push("General feedback. Listen and adapt to grow.");
      }
      
      setSummary(summaryLines.join('\n'));
    } catch (err) {
      console.error('Failed to summarize comments:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to summarize comments: ${err.response.data.message}`);
      } else {
        setError('Failed to summarize comments. Please try again.');
      }
    } finally {
      setSummarizing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image changes from the ImageUpload component
  const handleImageChange = (imageData) => {
    // Store the full imageData which includes both file objects and existing images
    setProfileData(prev => ({
      ...prev,
      images: imageData
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Validate required fields
      if (!profileData.businessName || !profileData.cuisineType || 
          !profileData.phoneNumber || !profileData.pincode) {
        setError('All required fields must be filled');
        return;
      }
      
      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(profileData.phoneNumber)) {
        setError('Phone number must be 10 digits');
        return;
      }
      
      // Validate pincode (6 digits)
      if (!/^\d{6}$/.test(profileData.pincode)) {
        setError('Pincode must be 6 digits');
        return;
      }
      
      // Prepare data for submission (excluding file objects)
      const dataToSend = { ...profileData };
      
      // Upload images if any new images were added
      if (profileData.images && profileData.images.length > 0) {
        // Filter out images that have file objects (newly added images)
        const newImages = profileData.images.filter(img => img.file);
        const existingImages = profileData.images.filter(img => !img.file);
        
        let uploadedImages = [...existingImages];
        
        if (newImages.length > 0) {
          // Extract actual File objects
          const filesToUpload = newImages.map(img => img.file);
          
          // Upload the new images
          const uploadedResults = await uploadImages(filesToUpload);
          
          // Combine with existing images
          uploadedImages = [...existingImages, ...uploadedResults];
        }
        
        // Update data to send with uploaded image URLs
        dataToSend.images = uploadedImages;
      }
      
      await vendorAPI.updateProfile(dataToSend);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      
      // Refresh follower count
      try {
        const followerResponse = await vendorAPI.getVendorFollowerCount(profileData._id);
        setFollowerCount(followerResponse.data.followerCount);
      } catch (followerErr) {
        console.error('Failed to fetch follower count:', followerErr);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div>
        {/* Navigation Bar */}
        <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 onClick={() => navigate('/vendor/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/vendor/profile')}>
                Profile
              </button>
              <button onClick={() => navigate('/vendor/menu')}>
                Menu
              </button>
              <button onClick={() => navigate('/vendor/location')}>
                Location
              </button>
              <button onClick={() => navigate('/vendor/broadcast')}>
                Broadcast
              </button>
              <button onClick={() => navigate('/vendor/discussions')}>
                Discussions
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>
        
        <div style={{ padding: '1rem' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
            <div>Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      {/* Navigation Bar */}
      <nav style={{ padding: '1rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 onClick={() => navigate('/vendor/dashboard')} style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}>VendorScout</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate('/vendor/profile')}
              className="btn-vendor"
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
        {/* Header */}
        <header className="vendor-dashboard-card">
          <div className="text-center">
            <h1 className="vendor-section-title">Vendor Profile</h1>
            <p>Manage your business information</p>
          </div>
        </header>

        {/* Success Message */}
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

        {/* Error Message */}
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

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Profile Form */}
          <div style={{ flex: '2' }}>
            <div className="vendor-dashboard-card">
              <div className="vendor-section-header">
                <h2 className="vendor-section-title">
                  {isEditing ? 'Edit Profile' : 'Profile Information'}
                </h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-vendor"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <div>
                  {/* Image Upload Section */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                      Vendor Images (Max 5)
                    </label>
                    <ImageUpload 
                      onImagesChange={handleImageChange} 
                      maxImages={5}
                      initialImages={profileData.images || []}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Business Name *
                      </label>
                      <input
                        type="text"
                        name="businessName"
                        value={profileData.businessName}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
                        required
                      />
                    </div>
                    
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Cuisine Type *
                      </label>
                      <input
                        type="text"
                        name="cuisineType"
                        value={profileData.cuisineType}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
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
                      value={profileData.description}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
                      rows="3"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
                        required
                      />
                    </div>
                    
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={profileData.pincode}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>
                      Status
                    </label>
                    <select
                      name="status"
                      value={profileData.status}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #000', borderRadius: '4px' }}
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="relocating">Relocating</option>
                      <option value="sold_out">Sold Out</option>
                    </select>
                  </div>

                  <div style={{ paddingTop: '1rem' }}>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.75rem' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form to original data
                        fetchVendorProfile();
                      }}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#f0f0f0', color: '#000', border: '1px solid #000', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <span style={{ color: '#000' }}><strong>Business Name:</strong> {profileData.businessName}</span>
                    </div>
                    
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <span style={{ color: '#000' }}><strong>Cuisine Type:</strong> {profileData.cuisineType}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#000' }}><strong>Description:</strong> {profileData.description || 'No description provided'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <span style={{ color: '#000' }}><strong>Phone Number:</strong> {profileData.phoneNumber}</span>
                    </div>
                    
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <span style={{ color: '#000' }}><strong>Pincode:</strong> {profileData.pincode}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#000' }}><strong>Address:</strong> {profileData.address || 'No address provided'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <span style={{ color: '#000' }}><strong>Status:</strong> {profileData.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Section */}
          <div style={{ flex: '1' }}>
            <div className="vendor-dashboard-card">
              <div className="vendor-section-header">
                <h2 className="vendor-section-title">Profile Summary</h2>
              </div>
              <div className="summary-section">
                <h3 className="summary-title">Customer Feedback Insights</h3>
                {summarizing ? (
                  <div className="empty-state-vendor">
                    <div></div>
                    <p>Analyzing customer feedback...</p>
                  </div>
                ) : summary ? (
                  <div className="summary-content">{summary}</div>
                ) : (
                  <div className="empty-state-vendor">
                    <div></div>
                    <p>No summary available. Click below to generate insights from customer comments.</p>
                  </div>
                )}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button
                    onClick={summarizeComments}
                    disabled={summarizing}
                    className="btn-vendor"
                    style={{ width: '100%' }}
                  >
                    {summarizing ? 'Analyzing...' : 'Analyze Customer Feedback'}
                  </button>
                </div>
              </div>
              

            </div>
          </div>
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

export default VendorProfile;