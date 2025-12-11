import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import '../styles/globals.css';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = (userData) => {
    console.log('Registration successful:', userData);
    // Additional logic after successful registration if needed
  };

  return (
    <div className="simple-register">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">VendorScout</h1>
          <p className="register-subtitle">Create your account</p>
        </div>
        
        <div className="register-form-container">
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
        </div>
        
        <div className="register-footer">
          <div className="footer-links">
            <a href="/login" className="btn-link">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;