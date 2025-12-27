import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/globals.css';

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, backgroundColor: '#ffffff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3rem', textAlign: 'center', color: '#000000' }}>
            Contact Us
          </h1>
          
          <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#000000' }}>
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Get in Touch
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                We'd love to hear from you. Whether you have a question, feedback, or just want to say hello, feel free to reach out to us.
              </p>
            </section>

            <section style={{ marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '1px solid #e5e5e5' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Contact Information
              </h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>
                  Email
                </p>
                <p style={{ fontSize: '0.875rem', color: '#000000' }}>
                  support@vendorscout.com
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>
                  Phone
                </p>
                <p style={{ fontSize: '0.875rem', color: '#000000' }}>
                  +91 1234567890
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999999', marginBottom: '0.5rem' }}>
                  Address
                </p>
                <p style={{ fontSize: '0.875rem', color: '#000000' }}>
                  123 Street Food Lane<br />
                  Food District, City 110001<br />
                  India
                </p>
              </div>
            </section>

            <section>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Support Hours
              </h2>
              <p style={{ marginBottom: '0.5rem' }}>
                Monday - Friday: 9:00 AM - 6:00 PM
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                Saturday: 10:00 AM - 4:00 PM
              </p>
              <p>
                Sunday: Closed
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
