// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import api from '../services/api';

const API_BASE = 'http://127.0.0.1:8000';

function getPoster(item) {
  if (!item) return null;
  const url = item.poster || item.poster_url;
  if (!url) return null;
  return url.startsWith('http') ? url : API_BASE + url;
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [favMovies,  setFavMovies]  = useState([]);
  const [favSeries,  setFavSeries]  = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      api.get('/favorites/'),
      api.get('/user-reviews/'),
    ]).then(([favRes, revRes]) => {
      if (favRes.data.success) {
        setFavMovies(favRes.data.movies || []);
        setFavSeries(favRes.data.series || []);
      }
      if (revRes.data.success) {
        setReviews(revRes.data.reviews || []);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || user?.email;

  const initials = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase();

  const toggleFav = async (slug, type, cardSetter, list) => {
    try {
      const { data } = await api.post('/favorite/toggle/', { slug, content_type: type });
      if (data.success && !data.is_favorite) {
        cardSetter(prev => prev.filter(item => item.slug !== slug));
      }
    } catch (e) { console.error(e); }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const { data } = await api.post(`/review/${reviewId}/delete/`);
      if (data.success) setReviews(prev => prev.filter(r => r.review.id !== reviewId));
    } catch (e) { console.error(e); }
  };

  const totalFavs = favMovies.length + favSeries.length;

  return (
    <div style={{ padding: '32px 4vw', maxWidth: 1100, margin: '0 auto', color: '#fff' }}>
      <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ width: 220, flexShrink: 0, textAlign: 'center' }}>
          {/* Avatar */}
          <div style={{
            width: 180, height: 180, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc3545, #6b0000)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 60, margin: '0 auto 16px', border: '4px solid #333',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}>
            {user?.avatar
              ? <img src={API_BASE + user.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials
            }
          </div>

          <h3 style={{ marginBottom: 4 }}>{displayName}</h3>

          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', textAlign: 'left',
          }}>
            {[
              ['Email', user?.email],
['Member Since', user?.date_joined
  ? new Date(user.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{label}:</strong>
                <div style={{ fontSize: 14, marginTop: 2 }}>{value || '—'}</div>
              </div>
            ))}
          </div>
          <Link
  to="/profile/edit"
  style={{
    display: 'block',
    marginTop: 18,
    padding: '10px 0',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
    boxShadow: '0 6px 18px rgba(13,110,253,0.35)',
    transition: 'all 0.25s ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 10px 24px rgba(13,110,253,0.5)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'none';
    e.currentTarget.style.boxShadow = '0 6px 18px rgba(13,110,253,0.35)';
  }}
>
  Edit Profile
</Link>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* FAVORITES */}
          <div style={{ marginBottom: 48 }}>
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              My Favorites ({totalFavs})
            </h4>

            {loading ? (
              <p style={{ color: '#aaa' }}>Loading…</p>
            ) : (
              <>
                {/* Favorite Movies */}
                {favMovies.length > 0 && (
                  <>
                    <h5 style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                      Movies ({favMovies.length})
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
                      {favMovies.map(movie => (
                        <FavCard key={movie.slug} item={movie} type="movie"
                          onRemove={() => toggleFav(movie.slug, 'movie', setFavMovies)} />
                      ))}
                    </div>
                  </>
                )}

                {/* Favorite Series */}
                {favSeries.length > 0 && (
                  <>
                    <h5 style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 12, marginTop: favMovies.length ? 24 : 0 }}>
                      Series ({favSeries.length})
                    </h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                      {favSeries.map(series => (
                        <FavCard key={series.slug} item={series} type="series"
                          onRemove={() => toggleFav(series.slug, 'series', setFavSeries)} />
                      ))}
                    </div>
                  </>
                )}

                {totalFavs === 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🤍</div>
                    <h5 style={{ color: '#aaa', marginBottom: 8 }}>No favorites yet.</h5>
                    <p style={{ color: '#666', marginBottom: 16 }}>Start adding movies and series you love!</p>
                    <Link to="/browse" style={{ ...btnOutline, textDecoration: 'none' }}>Browse Content</Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* REVIEWS */}
          <div>
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              My Reviews ({reviews.length})
            </h4>

            {reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {reviews.map(item => (
                  <ReviewCard key={item.review.id} item={item} onDelete={deleteReview} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                <h5 style={{ color: '#888', marginBottom: 8 }}>You haven't reviewed anything yet.</h5>
                <p style={{ color: '#666', marginBottom: 16 }}>Go watch something and share your opinion!</p>
                <Link to="/browse" style={{ ...btnOutlineDanger, textDecoration: 'none' }}>Browse Content</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Favorite card with remove button ──
function FavCard({ item, type, onRemove }) {
  const link = `/${type}/${item.slug}`;
  const poster = getPoster(item);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.preventDefault();
    setRemoving(true);
    await onRemove();
  };

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)', position: 'relative',
      transition: 'transform 0.3s, box-shadow 0.3s',
      opacity: removing ? 0.4 : 1,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(220,53,69,0.4)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Remove button (top right) */}
      <button onClick={handleRemove} style={{
        position: 'absolute', top: 8, right: 8, zIndex: 2,
        width: 36, height: 36, borderRadius: '50%',
        background: '#dc3545', border: 'none', cursor: 'pointer',
        color: '#fff', fontSize: 16, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>♥</button>

      <Link to={link} style={{ textDecoration: 'none' }}>
        {poster ? (
          <img src={poster} alt={item.title}
            style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div style={{ width: '100%', height: 200, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            🎬
          </div>
        )}
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            {item.year || item.first_air_date || '—'}
            {item.duration ? ` • ${item.duration} min` : ''}
            {item.seasons_count ? ` • ${item.seasons_count} season${item.seasons_count !== 1 ? 's' : ''}` : ''}
          </div>
          {item.rating > 0 && (
            <div style={{ color: '#f5c518', fontSize: 12, marginTop: 4 }}>★ {Number(item.rating).toFixed(1)}</div>
          )}
        </div>
      </Link>
    </div>
  );
}

// ── Review card ──
function ReviewCard({ item, onDelete }) {
  const link = `/${item.type}/${item.slug}`;
  const poster = item.poster_url
    ? (item.poster_url.startsWith('http') ? item.poster_url : API_BASE + item.poster_url)
    : null;

  return (
    <div style={{
      background: '#1a1a1a', borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
    }}>
      {/* Poster */}
      <Link to={link} style={{ flexShrink: 0, width: 100 }}>
        {poster ? (
          <img src={poster} alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: 160, display: 'block' }}
            onError={e => { e.target.src = 'https://via.placeholder.com/100x160/333/555/?text=?'; }} />
        ) : (
          <div style={{ width: 100, minHeight: 160, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 24 }}>
            {item.type === 'series' ? '📺' : '🎬'}
          </div>
        )}
      </Link>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h5 style={{ marginBottom: 4, fontSize: 16 }}>
            <Link to={link} style={{ color: item.type === 'movie' ? '#dc3545' : '#0d6efd', textDecoration: 'none', fontWeight: 700 }}>
              {item.type === 'movie' ? '🎬' : '📺'} {item.title}
            </Link>
          </h5>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>
            {item.year} • {item.type === 'movie' ? 'Movie' : 'Series'}
          </p>

          {/* Stars */}
          <div style={{ marginBottom: 10 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} style={{ color: i < item.review.rating ? '#f5c518' : '#444', fontSize: 14 }}>★</span>
            ))}
            <span style={{ color: '#fff', marginLeft: 8, fontWeight: 700 }}>{item.review.rating}/10</span>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
            {item.review.comment || 'No comment provided.'}
          </p>

          <small style={{ color: '#666' }}>
            📅 {new Date(item.review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </small>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <Link to={link} style={{
            ...btnOutlineWarning, textDecoration: 'none', textAlign: 'center', fontSize: 13,
          }}>✏️ Edit</Link>
          <button onClick={() => onDelete(item.review.id)} style={{ ...btnOutlineDanger, fontSize: 13 }}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const btnOutline = {
  display: 'inline-block', padding: '8px 20px', borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
  background: 'none', cursor: 'pointer', fontSize: 14,
};
const btnOutlineDanger = {
  padding: '6px 16px', borderRadius: 20,
  border: '1px solid #dc3545', color: '#dc3545',
  background: 'none', cursor: 'pointer',
};
const btnOutlineWarning = {
  padding: '6px 16px', borderRadius: 20,
  border: '1px solid #ffc107', color: '#ffc107',
  background: 'none', cursor: 'pointer',
};
