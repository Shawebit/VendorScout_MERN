import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/globals.css';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, backgroundColor: '#ffffff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3rem', textAlign: 'center', color: '#000000' }}>
            Terms of Service
          </h1>
          
          <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#000000' }}>
            <p style={{ marginBottom: '2rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999' }}>
              Last Updated: December 2024
            </p>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Acceptance of Terms
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                By accessing and using VendorScout, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Use of Service
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                You agree to use VendorScout only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the service.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                You must not:
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Post false or misleading information
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Impersonate others or misrepresent your affiliation
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Engage in any activity that disrupts the service
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Violate any applicable laws or regulations
                </li>
              </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                User Content
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                You retain ownership of any content you post on VendorScout. However, by posting content, you grant us a license to use, modify, and display that content in connection with our services.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Vendor Listings
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                VendorScout provides a platform for vendors to list their services. We do not guarantee the accuracy of vendor information or the quality of their products. Users interact with vendors at their own risk.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Limitation of Liability
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                VendorScout shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Changes to Terms
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
