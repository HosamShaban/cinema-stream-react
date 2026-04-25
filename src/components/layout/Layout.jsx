// src/components/layout/Layout.jsx
// هذا مثل index.html في Django — يغلف كل الصفحات بـ Navbar + Footer
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div style={{ background: '#111', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <Navbar />
      <main style={{ paddingTop: 70 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
