import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/globals.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, backgroundColor: '#ffffff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3rem', textAlign: 'center', color: '#000000' }}>
            Privacy Policy
          </h1>
          
          <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#000000' }}>
            <p style={{ marginBottom: '2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999' }}>
              Last Updated: December 2024
            </p>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Information We Collect
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We collect information that you provide directly to us, including your name, email address, phone number, and location data when you use our services. We also collect information about your interactions with vendors and reviews you post.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                How We Use Your Information
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We use the information we collect to:
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Provide and improve our services
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Connect you with street food vendors
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Send you updates and notifications
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Improve user experience and personalize content
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Data Security
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Your Rights
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                You have the right to access, update, or delete your personal information at any time. You can also opt out of receiving promotional communications from us.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Contact Us
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                If you have any questions about this Privacy Policy, please contact us at privacy@vendorscout.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
