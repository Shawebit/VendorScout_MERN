import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <h1 className="navbar-logo" onClick={() => navigate('/')}>VendorScout</h1>
        </div>
        
        <nav className="navbar-menu">
          {user ? (
            <div className="navbar-user">
              <span className="navbar-username">{user.username}</span>
              <button 
                onClick={handleLogout}
                className="btn btn-secondary navbar-logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-secondary"
              >
                Log in
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="btn btn-primary"
              >
                Sign up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;