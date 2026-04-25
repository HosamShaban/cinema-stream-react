import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks';
import { createReview } from '../../store/slices/reviewsSlice';
import { StarRating } from './StarRating';

export function ReviewForm({ movieId, seriesId }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(0);

  if (!isAuthenticated) return (
    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
      Sign in to write a review.
    </p>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() || !rating) return;
    await dispatch(createReview({ body, rating, movie: movieId, series: seriesId }));
    setBody(''); setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <StarRating value={rating} onChange={setRating} size={24} />
      <textarea value={body} onChange={e => setBody(e.target.value)}
        placeholder="Write your review…" rows={3}
        style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px',
          resize: 'vertical', outline: 'none', boxSizing: 'border-box', width: '100%',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
        onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
      />
      <button type="submit" disabled={!body.trim() || !rating} style={{
        alignSelf: 'flex-start', background: '#E50914', color: '#fff',
        border: 'none', borderRadius: '6px', padding: '10px 24px',
        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        opacity: (!body.trim() || !rating) ? 0.5 : 1,
      }}>Submit Review</button>
    </form>
  );
}
