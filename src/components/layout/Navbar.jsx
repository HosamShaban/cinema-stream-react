// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import api from '../../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [search, setSearch]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug]         = useState(false);
  const [dropOpen, setDropOpen]       = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (search.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/search-suggestions/', { params: { q: search } });
        setSuggestions(data.results || []);
      } catch { setSuggestions([]); }
    }, 300);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target)) setShowSug(false);
      setDropOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/browse?q=${encodeURIComponent(search)}`); setShowSug(false); setSearch(''); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1030,
      background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid #333', padding: '0 24px', height: '70px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16,
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>🎬</span>
        <span style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Cinema Stream</span>
      </Link>

      {/* Search */}
      <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 500 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex' }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSug(true); }}
            onFocus={() => search.trim() && setShowSug(true)}
            placeholder="Search movies & series..."
            style={{
              flex: 1, background: '#2d2d2d', border: '1px solid #555',
              borderRadius: '6px 0 0 6px', padding: '10px 14px',
              color: '#fff', fontSize: 14, outline: 'none', height: 42,
            }}
            onFocusCapture={e => e.target.style.borderColor = '#dc3545'}
            onBlurCapture={e  => e.target.style.borderColor = '#555'}
          />
          <button type="submit" style={{
            background: '#dc3545', border: 'none', borderRadius: '0 6px 6px 0',
            padding: '0 16px', color: '#fff', cursor: 'pointer', fontSize: 16,
          }}>🔍</button>
        </form>

        {showSug && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
            background: '#141414', border: '1px solid #444', borderRadius: 8,
            maxHeight: '60vh', overflowY: 'auto', marginTop: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}>
            {suggestions.map((s, i) => (
              <a key={i} href={s.url} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', textDecoration: 'none', color: '#fff',
                borderBottom: '1px solid #333', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#dc3545'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <img
                  src={s.poster || 'https://via.placeholder.com/40x60/333/DC3545/?text=?'}
                  style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }}
                  alt={s.title}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  <small style={{ color: '#aaa' }}>
                    {s.year} • <span style={{ color: '#dc3545' }}>{s.type === 'series' ? 'TV Series' : 'Movie'}</span>
                  </small>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {[['/', '🏠 Home'], ['/browse', '🧭 Browse']].map(([path, label]) => (
          <Link key={path} to={path} style={{
            color: '#fff', textDecoration: 'none', padding: '8px 14px',
            borderRadius: 6, fontSize: 14, transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,53,69,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >{label}</Link>
        ))}

        {isAuthenticated ? (
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setDropOpen(o => !o)} style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', padding: '8px 14px', borderRadius: 6,
              cursor: 'pointer', fontSize: 14,
            }}>👤 Profile ▾</button>

            {dropOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                background: '#1a1a1a', border: '1px solid #333',
                borderRadius: 8, overflow: 'hidden', minWidth: 160,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}>
                <Link to="/profile" onClick={() => setDropOpen(false)} style={dropItemStyle}>
                  👤 My Profile
                </Link>
                <button onClick={handleLogout} style={{ ...dropItemStyle, width: '100%', textAlign: 'left', color: '#dc3545' }}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={outlineBtnStyle}>Login</Link>
            <Link to="/register" style={{ ...outlineBtnStyle, background: '#dc3545', borderColor: '#dc3545' }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const outlineBtnStyle = {
  color: '#fff', textDecoration: 'none', padding: '8px 14px',
  borderRadius: 6, fontSize: 14, border: '1px solid rgba(255,255,255,0.3)',
};

const dropItemStyle = {
  display: 'block', padding: '12px 16px', color: '#fff',
  textDecoration: 'none', fontSize: 14, cursor: 'pointer',
  background: 'none', border: 'none', borderBottom: '1px solid #333',
  transition: 'background 0.2s',
};
