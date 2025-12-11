import './Footer.css';

const Footer = () => {
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
              <li><a href="#" className="footer-link">About Us</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
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

export default Footer;