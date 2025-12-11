import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/globals.css';
import './LoginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [loginType, setLoginType] = useState('email'); // 'email' for customers, 'phone' for vendors
  const [formData, setFormData] = useState({
    identifier: '', // Will be either email or phone based on loginType
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setFormData({
      identifier: '',
      password: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.identifier.trim()) {
      newErrors.identifier = loginType === 'email' ? 'Email is required' : 'Phone number is required';
    } else {
      if (loginType === 'email' && !/\S+@\S+\.\S+/.test(formData.identifier)) {
        newErrors.identifier = 'Email is invalid';
      } else if (loginType === 'phone' && !/^\d{10}$/.test(formData.identifier)) {
        newErrors.identifier = 'Phone number must be 10 digits';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Prepare data for submission
      const requestData = {
        password: formData.password
      };
      
      // Add identifier based on login type
      if (loginType === 'email') {
        requestData.email = formData.identifier;
      } else {
        requestData.phoneNumber = formData.identifier;
      }
      
      const response = await authAPI.login(requestData);
      
      // Update auth context (token is saved inside the login function)
      await login(response.data);
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(response.data);
      }
      
      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        // Navigate based on role
        if (response.data.role === 'vendor') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Login failed. Please check your credentials.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-login-form">
      {/* Login type toggle - simplified */}
      <div className="login-type-selector">
        <div className="selector-buttons">
          <button
            className={`selector-btn ${loginType === 'email' ? 'active' : ''}`}
            onClick={() => handleLoginTypeChange('email')}
          >
            Customer
          </button>
          <button
            className={`selector-btn ${loginType === 'phone' ? 'active' : ''}`}
            onClick={() => handleLoginTypeChange('phone')}
          >
            Vendor
          </button>
        </div>
      </div>
      
      {/* Error messages */}
      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}
      
      {/* Login form */}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-fields">
          {/* Identifier field (email or phone) */}
          <div className="form-field">
            <input
              id="identifier"
              name="identifier"
              type={loginType === 'email' ? 'email' : 'tel'}
              autoComplete={loginType === 'email' ? 'email' : 'tel'}
              required
              value={formData.identifier}
              onChange={handleChange}
              placeholder={loginType === 'email' ? 'Email' : 'Phone number'}
              className={`form-input ${errors.identifier ? 'error' : ''}`}
            />
            {errors.identifier && (
              <p className="field-error">{errors.identifier}</p>
            )}
          </div>
          
          {/* Password field */}
          <div className="form-field">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={`form-input ${errors.password ? 'error' : ''}`}
            />
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>
        </div>
        
        {/* Submit button */}
        <div className="form-submit">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary submit-btn"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;