import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #dbeafe, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}></div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>Access Denied</h1>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
          You don't have permission to view this page. Please log in with appropriate credentials.
        </p>
        <div>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '0.5rem 1rem', backgroundColor: '#4f46e5', color: '#fff', fontWeight: '500', borderRadius: '0.375rem', cursor: 'pointer', marginBottom: '1rem' }}
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', color: '#374151', fontWeight: '500', borderRadius: '0.375rem', cursor: 'pointer', backgroundColor: '#fff' }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;