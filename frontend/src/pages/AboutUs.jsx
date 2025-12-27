import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import '../styles/globals.css';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, backgroundColor: '#ffffff', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '300', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '3rem', textAlign: 'center', color: '#000000' }}>
            About Us
          </h1>
          
          <div style={{ fontSize: '0.875rem', lineHeight: '1.8', color: '#000000' }}>
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Our Mission
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                VendorScout is dedicated to connecting food lovers with authentic street food vendors in their local communities. We believe that every street food vendor has a story to tell and delicious food to share.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                What We Do
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Our platform provides real-time tracking, community reviews, and detailed information about street food vendors. Whether you're looking for the best biryani in town or want to discover new flavors, VendorScout helps you find exactly what you're craving.
              </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Our Values
              </h2>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Supporting local street food vendors and their businesses
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Building a community of food enthusiasts
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Promoting authentic and quality street food
                </li>
                <li style={{ marginBottom: '1rem', paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span>
                  Making street food discovery easy and accessible
                </li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', color: '#000000' }}>
                Join Us
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                Whether you're a food vendor looking to reach more customers or a food lover searching for your next favorite meal, VendorScout is here to help. Join our growing community today.
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
