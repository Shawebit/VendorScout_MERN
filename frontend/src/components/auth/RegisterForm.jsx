import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/globals.css';
import './RegisterForm.css';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    pincode: '',
    role: 'customer' // default to customer
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Pincode is now required for both customers and vendors for the discussion feature
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    
    // Additional validation for vendors
    if (formData.role === 'vendor') {
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required for vendors';
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Phone number must be 10 digits';
      }
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
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        pincode: formData.pincode // Pincode is now required for all users
      };
      
      // Add vendor-specific fields if role is vendor
      if (formData.role === 'vendor') {
        requestData.phoneNumber = formData.phoneNumber;
      }
      
      const response = await authAPI.register(requestData);
      
      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      
      // Update auth context
      login(response.data);
      
      // Call success callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess(response.data);
      }
      
      // Navigate based on role
      if (formData.role === 'vendor') {
        navigate('/vendor/profile');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-register-form">
      {errors.general && (
        <div className="error-message">
          {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-fields">
          <div className="form-field">
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className={`form-input ${errors.username ? 'error' : ''}`}
            />
            {errors.username && (
              <p className="field-error">{errors.username}</p>
            )}
          </div>
          
          <div className="form-field">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}
          </div>
          
          <div className="form-field">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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
          
          <div className="form-field">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>
          
          {/* Pincode field for all users */}
          <div className="form-field">
            <input
              id="pincode"
              name="pincode"
              type="text"
              required
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              className={`form-input ${errors.pincode ? 'error' : ''}`}
            />
            {errors.pincode && (
              <p className="field-error">{errors.pincode}</p>
            )}
          </div>
          
          {/* Vendor-specific fields */}
          {formData.role === 'vendor' && (
            <div className="form-field">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Phone Number"
                className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              />
              {errors.phoneNumber && (
                <p className="field-error">{errors.phoneNumber}</p>
              )}
            </div>
          )}
          
          <div className="role-selection">
            <div className="role-options">
              <label className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                  className="role-radio"
                />
                <span className="role-label">Customer</span>
              </label>
              <label className={`role-option ${formData.role === 'vendor' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="vendor"
                  checked={formData.role === 'vendor'}
                  onChange={handleChange}
                  className="role-radio"
                />
                <span className="role-label">Vendor</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-submit">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary submit-btn"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;