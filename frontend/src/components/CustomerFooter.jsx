import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-about">
            <h3 className="footer-logo">VendorScout</h3>
            <p className="footer-description">Discover the best street food vendors near you with real-time location tracking and community reviews.</p>
            {/* Customer-specific content */}
            <div className="customer-support">
              <h4>Customer Support</h4>
              <p>Have questions? Our support team is here to help you.</p>
              <p>Email: support@vendorscout.com | Phone: +91 7577865XXX</p>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-links-section">
              <h4 className="footer-links-title">Company</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link">About Us</a></li>
                <li><a href="#" className="footer-link">Contact</a></li>
                <li><a href="#" className="footer-link">Privacy Policy</a></li>
                <li><a href="#" className="footer-link">Terms of Service</a></li>
              </ul>
            </div>
            {/* Customer-specific links */}
            <div className="footer-links-section">
              <h4 className="footer-links-title">For Customers</h4>
              <ul className="footer-links-list">
                <li><a href="#" className="footer-link">My Account</a></li>
                <li><a href="#" className="footer-link">Order History</a></li>
                <li><a href="#" className="footer-link">Favorites</a></li>
                <li><a href="#" className="footer-link">Saved Searches</a></li>
              </ul>
            </div>
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