import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://vendorscout-backend.onrender.com/api', // Replace with your actual Render backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear local storage
      localStorage.removeItem('token');
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
};

// User API endpoints
export const userAPI = {
  updatePincode: (pincode) => api.put('/users/pincode', { pincode }),
  getProfile: () => api.get('/users/profile'),
};

// Vendor API endpoints
export const vendorAPI = {
  // Profile endpoints
  getProfile: () => api.get('/vendors/profile'),
  updateProfile: (profileData) => api.put('/vendors/profile', profileData),
  getVendorById: (vendorId) => api.get(`/vendors/profile/${vendorId}`),
  getAllVendors: (params) => api.get('/vendors', { params }),
  
  // Location endpoints
  updateLocation: (locationData) => api.put('/vendors/location', locationData),
  
  // Follow/unfollow endpoints
  followVendor: (vendorId) => api.post(`/vendors/follow/${vendorId}`),
  unfollowVendor: (vendorId) => api.post(`/vendors/unfollow/${vendorId}`),
  isFollowingVendor: (vendorId) => api.get(`/vendors/following/${vendorId}`),
  getFollowedVendors: () => api.get('/vendors/followed'),
  getVendorFollowerCount: (vendorId) => api.get(`/vendors/${vendorId}/followers/count`),
  
  // Rating endpoints
  rateVendor: (vendorId, ratingData) => api.post(`/vendors/${vendorId}/rate`, ratingData),
  getVendorRatingByCustomer: (vendorId) => api.get(`/vendors/${vendorId}/rating`),
  getVendorRatings: (vendorId) => api.get(`/vendors/${vendorId}/ratings`),
  
  // Menu endpoints
  getMenuItems: () => api.get('/vendors/menu'),
  getMenuItemsByVendor: (vendorId) => api.get(`/vendors/${vendorId}/menu`),
  addMenuItem: (menuItem) => api.post('/vendors/menu', menuItem),
  updateMenuItem: (menuItemId, menuItem) => api.put(`/vendors/menu/${menuItemId}`, menuItem),
  deleteMenuItem: (menuItemId) => api.delete(`/vendors/menu/${menuItemId}`),
  searchMenuItems: (query) => api.get(`/vendors/search/menu?query=${encodeURIComponent(query)}`),
  
  // Vendor search endpoint
  searchVendors: (query) => api.get(`/vendors/search/vendors?query=${encodeURIComponent(query)}`),
  
  // Broadcast message endpoints
  getBroadcastMessages: () => api.get('/vendors/broadcast'),
  getBroadcastMessagesByVendor: (vendorId) => api.get(`/vendors/${vendorId}/broadcast`),
  sendBroadcastMessage: (messageData) => api.post('/vendors/broadcast', messageData),
  deleteBroadcastMessage: (messageId) => api.delete(`/vendors/broadcast/${messageId}`)
};

// Comment API endpoints
export const commentAPI = {
  getComments: (params) => api.get('/comments', { params }),
  getCommentsByVendor: (vendorId) => api.get(`/comments/vendor/${vendorId}`),
  getCommentsByVendorPincode: () => api.get('/comments/vendor-pincode'),
  createComment: (commentData) => api.post('/comments', commentData),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  likeComment: (commentId) => api.post(`/comments/${commentId}/like`),
  getVendorCommentsSummary: () => api.get('/comments/vendor-summary'),
};

export default api;