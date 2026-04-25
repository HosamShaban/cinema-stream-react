// src/pages/MovieDetailPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import api from '../services/api';

const API_BASE = 'http://127.0.0.1:8000';

function getPosterUrl(movie) {
  if (!movie) return null;
  if (movie.get_poster_url) {
    const url = movie.get_poster_url;
    return url.startsWith('http') ? url : API_BASE + url;
  }
  if (movie.poster_path) return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  return null;
}

export default function MovieDetailPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isSeries    = location.pathname.startsWith('/series/');
  const contentType = isSeries ? 'series' : 'movie';

  const [movie,      setMovie]      = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [isFav,      setIsFav]      = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [rating,     setRating]     = useState('');
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg,  setSubmitMsg]  = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const endpoint = isSeries ? `/series/${slug}/` : `/movie/${slug}/`;

    Promise.all([
      api.get(endpoint),
      api.get('/review/', { params: { slug, content_type: contentType } }),
    ]).then(([mRes, rRes]) => {
      setMovie(mRes.data);
      setReviews(rRes.data?.results || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  // جيب حالة الـ favorite من Django عند تحميل الصفحة
  useEffect(() => {
    if (!isAuthenticated || !slug) return;
    api.get('/favorites/').then(({ data }) => {
      if (data.success) {
        const allFavs = [...(data.movies || []), ...(data.series || [])];
        setIsFav(allFavs.some(f => f.slug === slug));
      }
    }).catch(() => {});
  }, [isAuthenticated, slug]);

  const toggleFav = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const { data } = await api.post('/favorite/toggle/', { slug, content_type: contentType });
      if (data.success) setIsFav(data.is_favorite);
      else if (data.login_required) navigate('/login');
    } catch (e) { console.error(e); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('comment', comment);
      formData.append('slug', slug);
      formData.append('content_type', contentType);

      const { data } = await api.post('/review/submit/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setSubmitMsg('✅ Review submitted!');
        setReviews(prev => [{
          id: Date.now(),
          rating: Number(rating),
          comment,
          user: { id: user?.id, username: user?.username || user?.email },
          created_at: new Date().toISOString(),
        }, ...prev.filter(r => r.user?.id !== user?.id)]);
        setRating(''); setComment('');
      } else {
        setSubmitMsg('❌ ' + (data.error || 'Failed'));
      }
    } catch (e) {
      setSubmitMsg('❌ Error: ' + (e.response?.data?.error || e.message));
    }
    setSubmitting(false);
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return;
    try {
      const { data } = await api.post(`/review/${reviewId}/delete/`);
      if (data.success) setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch {}
  };

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 50, height: 50, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #dc3545', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!movie) return (
    <div style={{ textAlign: 'center', padding: '100px 0', color: '#aaa' }}>
      <div style={{ fontSize: 60 }}>{isSeries ? '📺' : '🎬'}</div>
      <p style={{ marginTop: 16 }}>Content not found.</p>
      <button onClick={() => navigate(-1)} style={{ ...btnDanger, marginTop: 16 }}>← Go Back</button>
    </div>
  );

  const posterUrl   = getPosterUrl(movie);
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : posterUrl;

  return (
    <div style={{ color: '#fff', minHeight: '100vh' }}>

      {/* BACKDROP */}
      <div style={{ position: 'relative', minHeight: 480 }}>
        {backdropUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.35)',
          }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), #111)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '24px 5vw' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
            padding: '8px 16px', borderRadius: 6, cursor: 'pointer', marginBottom: 32, fontSize: 14,
          }}>← Back</button>

          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {/* Poster */}
            <div style={{ flexShrink: 0 }}>
              {posterUrl ? (
                <img src={posterUrl} alt={movie.title}
                  style={{ width: 220, borderRadius: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', display: 'block' }} />
              ) : (
                <div style={{ width: 220, height: 330, borderRadius: 12, background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>
                  {isSeries ? '📺' : '🎬'}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 280 }}>
              {/* Content type badge */}
              <div style={{ marginBottom: 12 }}>
                <span style={{
                  background: isSeries ? '#0d6efd' : '#198754',
                  color: '#fff', padding: '4px 12px', borderRadius: 4,
                  fontSize: 13, fontWeight: 700,
                }}>{isSeries ? '📺 TV Series' : '🎬 Movie'}</span>
              </div>

              <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
                {movie.title}
              </h1>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <span style={badge('#0d6efd')}>★ {Number(movie.overall_rating || 0).toFixed(1)}</span>
                {(movie.release_year || movie.first_air_date) && (
                  <span style={badge('#198754')}>📅 {movie.release_year || movie.first_air_date}</span>
                )}
                {movie.duration && <span style={badge('#0dcaf0', '#000')}>⏱ {movie.duration} min</span>}
                {movie.seasons_count && <span style={badge('#6f42c1')}>📺 {movie.seasons_count} Seasons</span>}
                {movie.episodes_count && <span style={badge('#6f42c1')}>🎞 {movie.episodes_count} Episodes</span>}
                {movie.language && <span style={badge('#6c757d')}>🌐 {movie.language}</span>}
              </div>

              {movie.description && (
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 1.7, maxWidth: 600, marginBottom: 24 }}>
                  {movie.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {movie.trailer_url && (
                  <a href={movie.trailer_url} target="_blank" rel="noreferrer" style={{ ...btnDanger, textDecoration: 'none' }}>
                    ▶ Watch Trailer
                  </a>
                )}
                <button onClick={toggleFav} style={{
                  background: isFav ? 'rgba(220,53,69,0.2)' : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${isFav ? '#dc3545' : 'rgba(255,255,255,0.4)'}`,
                  color: isFav ? '#dc3545' : '#fff',
                  padding: '12px 24px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, transition: 'all 0.2s',
                }}>
                  {isFav ? '♥ Favorited' : '♡ Add to Favorites'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div style={{ padding: '48px 5vw', maxWidth: 860 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>Reviews ({reviews.length})</h2>

        {isAuthenticated ? (
          <form onSubmit={submitReview} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 12,
            padding: 24, marginBottom: 32, border: '1px solid rgba(220,53,69,0.3)',
          }}>
            <h3 style={{ fontSize: 16, marginBottom: 16, color: '#dc3545' }}>Write a Review</h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 0 150px' }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Rating</label>
                <select value={rating} onChange={e => setRating(e.target.value)} required
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #dc3545', borderRadius: 6, padding: 10, color: '#fff', fontSize: 14 }}>
                  <option value="">Choose...</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Stars</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 6 }}>Your Review</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} required rows={3}
                  placeholder={`What did you think of ${movie.title}?`}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #dc3545', borderRadius: 6, padding: 10, color: '#fff', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
            {submitMsg && <p style={{ color: submitMsg.startsWith('✅') ? '#22c55e' : '#dc3545', marginBottom: 12, fontSize: 14 }}>{submitMsg}</p>}
            <button type="submit" disabled={submitting} style={btnDanger}>
              {submitting ? 'Submitting…' : '📨 Submit Review'}
            </button>
          </form>
        ) : (
          <div style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 8, padding: 16, marginBottom: 28, color: '#ffc107' }}>
            ⚠️ Please <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>login</button> to write a review.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(review => (
            <div key={review.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#dc3545', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {review.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{review.user?.username || 'Anonymous'}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{new Date(review.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#f5c518', fontWeight: 700 }}>★ {review.rating}/10</span>
                  {review.user?.id === user?.id && (
                    <button onClick={() => deleteReview(review.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', padding: '4px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{review.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No reviews yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );
}

const btnDanger = {
  background: 'linear-gradient(45deg,#dc3545,#c82333)',
  color: '#fff', border: 'none', padding: '12px 28px',
  borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: 'pointer',
};
const badge = (bg, color = '#fff') => ({
  background: bg, color, padding: '4px 12px', borderRadius: 4, fontSize: 13, fontWeight: 600,
});
