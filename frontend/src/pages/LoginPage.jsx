import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import '../styles/globals.css';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData);
    // Additional logic after successful login if needed
  };

  return (
    <div className="simple-login">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">VendorScout</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
        
        <div className="login-form-container">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
        
        <div className="login-footer">
          <div className="footer-links">
            <a href="/forgot-password" className="btn-link">Forgot password?</a>
            <a href="/register" className="btn-link">Create account</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;