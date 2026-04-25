// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import api from '../services/api';

const API_BASE = 'http://127.0.0.1:8000';

export function getPoster(item) {
  if (!item) return null;
  if (item.poster) return item.poster.startsWith('http') ? item.poster : API_BASE + item.poster;
  if (item.poster_path) return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    // جيب بيانات الصفحة الرئيسية
    api.get('/home/').then(({ data }) => {
      setData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // جيب favorites المستخدم من Django عند تسجيل الدخول
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

  const toggleFav = async (slug, type) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data: res } = await api.post('/favorite/toggle/', { slug, content_type: type });
      if (res.success) setFavorites(p => ({ ...p, [slug]: res.is_favorite }));
    } catch {}
  };

  if (loading) return <Skeleton />;

  const { recently_added = [], trending = [], top_movies = [], top_series = [] } = data || {};

  return (
    <div>
      <Section title="Recently Added">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
          {recently_added.map(item => (
            <ContentCard key={`${item.content_type}-${item.id}`} item={item}
              isFav={!!favorites[item.slug]} onFav={toggleFav} />
          ))}
          {recently_added.length === 0 && <Empty />}
        </div>
      </Section>

      {top_movies.length > 0 && (
        <Section title="Top English Movies" dark>
          <HScroll>
            {top_movies.map(m => (
              <BigCard key={m.id} item={m} type="movie" isFav={!!favorites[m.slug]} onFav={toggleFav} />
            ))}
          </HScroll>
        </Section>
      )}

      {top_series.length > 0 && (
        <Section title="Top English Series" dark>
          <HScroll>
            {top_series.map(s => (
              <BigCard key={s.id} item={s} type="series" isFav={!!favorites[s.slug]} onFav={toggleFav} />
            ))}
          </HScroll>
        </Section>
      )}

      {trending.length > 0 && (
        <Section title="Trending Now">
          <HScroll>
            {trending.map(item => (
              <SmallCard key={`${item.content_type}-${item.id}`} item={item}
                isFav={!!favorites[item.slug]} onFav={toggleFav} />
            ))}
          </HScroll>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children, dark }) {
  return (
    <div style={{ padding: '32px 24px', background: dark ? 'rgba(0,0,0,0.55)' : 'transparent' }}>
      <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 24, textShadow: '2px 2px 10px rgba(0,0,0,0.8)', color: '#fff' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function HScroll({ children }) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 16 }}>
      <div style={{ display: 'flex', gap: 20, minWidth: 'max-content' }}>{children}</div>
    </div>
  );
}

function ContentCard({ item, isFav, onFav }) {
  const isSeries = item.content_type === 'series';
  const link     = `/${item.content_type}/${item.slug}`;
  const poster   = getPoster(item);

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)', position: 'relative',
      transition: 'transform 0.4s, box-shadow 0.4s', color: '#fff',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-15px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(220,53,69,0.5)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <span style={{
          background: isSeries ? '#0d6efd' : '#198754',
          color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
        }}>{isSeries ? '📺 SERIES' : '🎬 MOVIE'}</span>
      </div>

      <Link to={link}>
        {poster
          ? <img src={poster} alt={item.title} style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; }} />
          : <div style={{ width: '100%', height: 280, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
              {isSeries ? '📺' : '🎬'}
            </div>
        }
      </Link>

      <div style={{ padding: 12 }}>
        <h6 style={{ fontWeight: 700, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </h6>
        <div style={{ color: '#f5c518', fontSize: 13, marginBottom: 4 }}>
          ★ <strong>{Number(item.rating || 0).toFixed(1)}</strong>/10
        </div>
        <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>
          📅 {item.year || '—'}
          {item.duration ? ` • ${item.duration} min` : ''}
          {item.seasons_count ? ` • ${item.seasons_count} seasons` : ''}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link to={link} style={{
            flex: 1, background: 'linear-gradient(45deg,#dc3545,#c82333)',
            color: '#fff', textDecoration: 'none', padding: '7px 0',
            borderRadius: 6, textAlign: 'center', fontSize: 13, fontWeight: 600,
          }}>ℹ More Details</Link>
          <button onClick={() => onFav(item.slug, item.content_type)} style={{
            background: isFav ? 'rgba(220,53,69,0.15)' : 'none',
            border: `1px solid ${isFav ? '#dc3545' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: 6, padding: '7px 10px', cursor: 'pointer',
            color: isFav ? '#dc3545' : '#fff', fontSize: 16, transition: 'all 0.2s',
          }}>{isFav ? '♥' : '♡'}</button>
        </div>
      </div>
    </div>
  );
}

function BigCard({ item, type, isFav, onFav }) {
  const isSeries = type === 'series';
  const link     = `/${type}/${item.slug}`;
  const poster   = getPoster(item);

  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      <div style={{
        background: '#1a1a1a', borderRadius: 16, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.4s, box-shadow 0.4s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-15px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(220,53,69,0.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <Link to={link}>
          {poster
            ? <img src={poster} alt={item.title} style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: 380, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                {isSeries ? '📺' : '🎬'}
              </div>
          }
        </Link>
        <div style={{ padding: 16, color: '#fff' }}>
          <h5 style={{ fontWeight: 700, marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.title}
          </h5>
          <div style={{ color: '#f5c518', marginBottom: 6 }}>
            ★ <strong>{Number(item.rating || 0).toFixed(1)}</strong>/10
          </div>
          <p style={{ color: '#aaa', fontSize: 13, marginBottom: 4 }}>
            {item.year || '—'}
            {item.duration ? ` • ${item.duration} min` : ''}
            {item.seasons_count ? ` • ${item.seasons_count} seasons` : ''}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Link to={link} style={{
              flex: 1, background: 'linear-gradient(45deg,#dc3545,#c82333)',
              color: '#fff', textDecoration: 'none', padding: '9px 0',
              borderRadius: 20, textAlign: 'center', fontSize: 14, fontWeight: 600,
            }}>ℹ More Details</Link>
            <button onClick={() => onFav(item.slug, type)} style={{
              background: isFav ? 'rgba(220,53,69,0.15)' : 'none',
              border: `1px solid ${isFav ? '#dc3545' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
              color: isFav ? '#dc3545' : '#fff', fontSize: 18, transition: 'all 0.2s',
            }}>{isFav ? '♥' : '♡'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SmallCard({ item, isFav, onFav }) {
  const isSeries = item.content_type === 'series';
  const link     = `/${item.content_type}/${item.slug}`;
  const poster   = getPoster(item);
  return (
    <div style={{ width: 190, flexShrink: 0 }}>
      <div style={{
        background: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.3s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        <Link to={link}>
          {poster
            ? <img src={poster} alt={item.title} style={{ width: '100%', height: 270, objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: 270, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                {isSeries ? '📺' : '🎬'}
              </div>
          }
        </Link>
        <div style={{ padding: 10, color: '#fff' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#f5c518', fontSize: 12 }}>★ {Number(item.rating || 0).toFixed(1)}</span>
            <button onClick={() => onFav(item.slug, item.content_type)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: isFav ? '#dc3545' : 'rgba(255,255,255,0.4)', fontSize: 17, padding: 0,
            }}>{isFav ? '♥' : '♡'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#666' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
      <p>No content added recently.</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ padding: '32px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ height: 340, borderRadius: 16, background: 'rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
