// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useSelector(s => s.auth);

  // انتظر حتى يخلص التحقق من الـ session
  if (initializing) return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #dc3545',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
