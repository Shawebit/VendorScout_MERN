import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const LogoutButton = ({ onLogout, className = '' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Call parent callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to home page
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleLogout}

    >
      Logout
    </button>
  );
};

export default LogoutButton;