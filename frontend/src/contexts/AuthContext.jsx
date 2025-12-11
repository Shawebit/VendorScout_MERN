import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { vendorAPI, userAPI } from '../services/api'; // Import vendorAPI and userAPI

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          // Token is valid, fetch complete user data from backend
          try {
            const response = await userAPI.getProfile();
            setUser({
              id: response.data._id,
              username: response.data.username,
              email: response.data.email,
              role: response.data.role,
              pincode: response.data.pincode,
              token: token // Include token in user object
            });
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fall back to decoded token data
            setUser({
              id: decoded.id,
              username: decoded.username,
              email: decoded.email,
              role: decoded.role,
              token: token // Include token in user object
            });
          }
        } else {
          // Token expired, remove it and logout user
          logout();
        }
      } else {
        // No token found, ensure user is logged out
        setUser(null);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      // Invalid token, remove it and logout user
      logout();
    } finally {
      if (loading) {
        setLoading(false);
      }
    }
  };

  const login = async (userData) => {
    return new Promise((resolve) => {
      // Save token to localStorage
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }
      
      // Fetch complete user data including pincode
      userAPI.getProfile()
        .then(response => {
          setUser({
            id: response.data._id,
            username: response.data.username,
            email: response.data.email,
            role: response.data.role,
            phoneNumber: response.data.phoneNumber,
            pincode: response.data.pincode,
            vendorProfile: userData.vendorProfile,
            token: userData.token
          });
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          // Fall back to provided user data
          setUser({
            id: userData._id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            phoneNumber: userData.phoneNumber,
            pincode: userData.pincode,
            vendorProfile: userData.vendorProfile,
            token: userData.token
          });
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const logout = async () => {
    // If the user is a vendor, schedule status update to "closed" after 2 minutes
    if (user && user.role === 'vendor') {
      setTimeout(async () => {
        try {
          await vendorAPI.updateProfile({ status: 'closed' });
          console.log('Vendor status automatically set to closed after logout');
        } catch (error) {
          console.error('Error updating vendor status to closed:', error);
        }
      }, 120000); // 2 minutes = 120000 milliseconds
    }
    
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};