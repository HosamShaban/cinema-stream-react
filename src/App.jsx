// src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadProfile } from './store/slices/authSlice';

import Layout           from './components/layout/Layout';
import ProtectedRoute   from './components/common/ProtectedRoute';
import HomePage         from './pages/HomePage';
import BrowsePage       from './pages/BrowsePage';
import MovieDetailPage  from './pages/MovieDetailPage';
import ProfilePage      from './pages/ProfilePage';
import EditProfilePage  from './pages/EditProfilePage';
import AuthPage         from './pages/AuthPage';

const fontLink = document.createElement('link');
fontLink.rel  = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
document.head.appendChild(fontLink);

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadProfile());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Layout><HomePage /></Layout>} />
        <Route path="/browse"        element={<Layout><BrowsePage /></Layout>} />
        <Route path="/movie/:slug"   element={<Layout><MovieDetailPage /></Layout>} />
        <Route path="/series/:slug"  element={<Layout><MovieDetailPage /></Layout>} />
        <Route path="/profile"       element={<Layout><ProtectedRoute><ProfilePage /></ProtectedRoute></Layout>} />
        <Route path="/profile/edit"  element={<Layout><ProtectedRoute><EditProfilePage /></ProtectedRoute></Layout>} />
        <Route path="/login"         element={<AuthPage />} />
        <Route path="/register"      element={<AuthPage />} />
        <Route path="*" element={
          <Layout>
            <div style={{ textAlign: 'center', padding: '100px 0', color: '#fff' }}>
              <div style={{ fontSize: 80, fontWeight: 700, color: '#dc3545' }}>404</div>
              <p style={{ color: '#aaa' }}>Page not found</p>
              <a href="/" style={{ color: '#fff' }}>← Back to Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
