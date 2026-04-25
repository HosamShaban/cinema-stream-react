// src/components/movies/MovieCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites, useAuth } from '../../hooks';

export default function MovieCard({ item, type = 'movie' }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isFavoriteMovie, isFavoriteSeries, toggleFavoriteMovie, toggleFavoriteSeries } = useFavorites();
  const [hovered, setHovered] = useState(false);

  const isFav = type === 'movie' ? isFavoriteMovie(item.id) : isFavoriteSeries(item.id);
  const toggle = type === 'movie' ? toggleFavoriteMovie : toggleFavoriteSeries;
  const detailPath = `/${type}/${item.slug || item.id}`;
  
  const API_BASE = "http://127.0.0.1:8000";
  const imageUrl = item.poster?.startsWith('http') ? item.poster : `${API_BASE}${item.poster}`;

  const handleFav = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    toggle(item.id);
  };

  return (
    <div
      onClick={() => navigate(detailPath)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '8px', overflow: 'hidden',
        cursor: 'pointer', aspectRatio: '2/3',
        transform: hovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: hovered ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
        background: '#141414', zIndex: hovered ? 10 : 1
      }}
    >
      {/* 1. Poster Image */}
      <img
        src={imageUrl}
        alt={item.title || item.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster'; }}
      />

      {/* 2. Rating Badge (Visible when NOT hovered) */}
      {item.rating > 0 && !hovered && (
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          background: 'rgba(0,0,0,0.8)', borderRadius: '4px',
          padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px',
          zIndex: 5
        }}>
          <span style={{ color: '#F5C518', fontSize: '12px' }}>★</span>
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
            {Number(item.rating).toFixed(1)}
          </span>
        </div>
      )}

      {/* 3. Hover Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '15px', zIndex: 6
      }}>
        <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '10px', margin: 0 }}>
          {item.title || item.name}
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            flex: 1, background: '#E50914', color: '#fff', border: 'none',
            padding: '8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
          }}>▶ Play</button>
          
          <button onClick={handleFav} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: 'none',
            color: isFav ? '#E50914' : '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>{isFav ? '❤️' : '🤍'}</button>
        </div>
      </div>
    </div>
  );
}