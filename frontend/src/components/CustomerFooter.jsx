import { Link } from 'react-router-dom';
import './Footer.css';

const CustomerFooter = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <h3 className="footer-logo">VendorScout</h3>
            <p className="footer-description">Discover the best street food vendors near you with real-time location tracking and community reviews.</p>
          </div>
          <div className="footer-links">
            <ul className="footer-links-list">
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">&copy; 2025 VendorScout. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default CustomerFooter;