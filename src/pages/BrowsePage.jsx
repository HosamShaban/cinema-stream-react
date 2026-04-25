// src/pages/BrowsePage.jsx
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import api from '../services/api';

const API_BASE = 'http://127.0.0.1:8000';

function getPoster(item) {
  if (!item) return null;
  if (item.poster) return item.poster.startsWith('http') ? item.poster : API_BASE + item.poster;
  if (item.poster_path) return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  return null;
}

export default function BrowsePage() {
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();
  const { isAuthenticated } = useAuth();

  const [items,    setItems]    = useState([]);
  const [genres,   setGenres]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [hasNext,  setHasNext]  = useState(false);
  const [page,     setPage]     = useState(1);
  const [favorites, setFavorites] = useState({});

  const [type,  setType]  = useState(searchParams.get('type')  || 'all');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [year,  setYear]  = useState(searchParams.get('year')  || '');
  const query = searchParams.get('q') || '';

  const fetchItems = async (p = 1, reset = true) => {
    setLoading(true);
    try {
      const { data } = await api.get('/browse/', {
        params: { q: query, type, genre, year, page: p }
      });
      setItems(prev => reset ? data.results : [...prev, ...data.results]);
      setGenres(data.genres || []);
      setHasNext(data.has_next);
      setPage(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchItems(1, true); }, [query, type, genre, year]);

useEffect(() => {
  if (!isAuthenticated) return;
  api.get('/favorites/').then(({ data }) => {
    if (data.success) {
      const favMap = {};
      [...(data.movies || []), ...(data.series || [])].forEach(item => {
        favMap[item.slug] = true;
      });
      setFavorites(favMap);
    }
  }).catch(() => {});
}, [isAuthenticated]);

  const toggleFav = async (slug, contentType) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/favorite/toggle/', { slug, content_type: contentType });
      if (data.success) setFavorites(p => ({ ...p, [slug]: data.is_favorite }));
    } catch {}
  };

  const title = query
    ? `Results for "${query}"`
    : type === 'movie' ? 'Movies' : type === 'series' ? 'TV Series' : 'All Content';

  return (
    <div style={{ padding: '32px 4vw', color: '#fff', minHeight: '80vh' }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>

        {/* ── FILTERS SIDEBAR ── */}
        {!query && (
          <div style={{ width: 220, flexShrink: 0 }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', padding: 24, borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 90,
            }}>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Filters</h4>

              <FilterGroup label="Content Type">
                <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                  <option value="all">All Content</option>
                  <option value="movie">Movies</option>
                  <option value="series">TV Series</option>
                </select>
              </FilterGroup>

              <FilterGroup label="Genre">
                <select value={genre} onChange={e => setGenre(e.target.value)} style={selectStyle}>
                  <option value="">All Genres</option>
                  {genres.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                </select>
              </FilterGroup>

              <FilterGroup label="Year">
                <input
                  value={year} onChange={e => setYear(e.target.value)}
                  placeholder="e.g. 2024" style={{ ...selectStyle, width: '100%' }}
                />
              </FilterGroup>

              {(type !== 'all' || genre || year) && (
                <button onClick={() => { setType('all'); setGenre(''); setYear(''); }} style={{
                  width: '100%', marginTop: 8, background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)',
                  padding: '8px', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                }}>Clear Filters</button>
              )}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
            {items.length} titles found
          </p>

          {loading && items.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '2/3', borderRadius: 10, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
                {items.map(item => (
                  <BrowseCard key={`${item.content_type}-${item.id}`} item={item}
                    isFav={!!favorites[item.slug]} onFav={toggleFav} />
                ))}
              </div>

              {items.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#666' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
                  <p style={{ fontSize: 18 }}>No content found</p>
                  <p style={{ fontSize: 14, marginTop: 8 }}>Try changing your filters</p>
                </div>
              )}

              {hasNext && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <button
                    onClick={() => fetchItems(page + 1, false)}
                    disabled={loading}
                    style={{
                      background: 'none', border: '1px solid rgba(255,255,255,0.3)',
                      color: '#fff', padding: '14px 40px', borderRadius: 6,
                      fontSize: 15, cursor: 'pointer', fontWeight: 600,
                      opacity: loading ? 0.6 : 1,
                    }}>
                    {loading ? 'Loading…' : '↓ Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BrowseCard({ item, isFav, onFav }) {
  const isSeries = item.content_type === 'series';
  const link     = `/${item.content_type}/${item.slug}`;
  const poster   = getPoster(item);

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)', position: 'relative',
      transition: 'transform 0.3s, box-shadow 0.3s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 16px 36px rgba(220,53,69,0.4)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Type badge */}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
        <span style={{
          background: isSeries ? '#0d6efd' : '#dc3545',
          color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
        }}>{isSeries ? 'SERIES' : 'MOVIE'}</span>
      </div>

      {/* Fav button */}
      <button onClick={() => onFav(item.slug, item.content_type)} style={{
        position: 'absolute', top: 8, right: 8, zIndex: 1,
        width: 34, height: 34, borderRadius: '50%',
        background: isFav ? '#dc3545' : 'rgba(0,0,0,0.6)',
        border: `1px solid ${isFav ? '#dc3545' : 'rgba(255,255,255,0.3)'}`,
        color: '#fff', fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', backdropFilter: 'blur(4px)',
      }}>{isFav ? '♥' : '♡'}</button>

      <Link to={link}>
        {poster ? (
          <img src={poster} alt={item.title}
            style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ width: '100%', height: 240, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
            {isSeries ? '📺' : '🎬'}
          </div>
        )}
      </Link>

      <div style={{ padding: '10px 12px 14px' }}>
        <h6 style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
          {item.title}
        </h6>

        <div style={{ color: '#f5c518', fontSize: 12, marginBottom: 4 }}>
          ★ <strong>{Number(item.rating || 0).toFixed(1)}</strong>
        </div>

        <div style={{ color: '#888', fontSize: 12, marginBottom: 10 }}>
          {item.year || '—'}
          {item.duration ? ` • ${item.duration} min` : ''}
          {item.seasons_count ? ` • ${item.seasons_count} season${item.seasons_count !== 1 ? 's' : ''}` : ''}
        </div>

        {item.genres?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
            {item.genres.slice(0, 2).map(g => (
              <span key={g} style={{
                background: isSeries ? 'rgba(13,110,253,0.2)' : 'rgba(220,53,69,0.2)',
                color: isSeries ? '#6ea8fe' : '#f66',
                padding: '2px 6px', borderRadius: 4, fontSize: 11,
              }}>{g}</span>
            ))}
          </div>
        )}

        <Link to={link} style={{
          display: 'block', background: 'linear-gradient(45deg,#dc3545,#c82333)',
          color: '#fff', textDecoration: 'none', padding: '7px 0',
          borderRadius: 6, textAlign: 'center', fontSize: 13, fontWeight: 600,
        }}>ℹ More Details</Link>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const selectStyle = {
  width: '100%', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
  padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none',
};
