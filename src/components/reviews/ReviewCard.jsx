import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks';
import { deleteReview, updateReview } from '../../store/slices/reviewsSlice';
import { StarRating } from './StarRating';

export function ReviewCard({ review }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(review.body);
  const [editRating, setEditRating] = useState(review.rating);
  const isOwner = user?.id === review.user?.id;

  const handleUpdate = async () => {
    await dispatch(updateReview({ id: review.id, data: { body: editText, rating: editRating } }));
    setEditing(false);
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
      padding: '16px 20px', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#E50914', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff',
          }}>
            {review.user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
              {review.user?.username || 'Anonymous'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StarRating value={editing ? editRating : review.rating} onChange={setEditRating} readOnly={!editing} size={16} />
          {isOwner && !editing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditing(true)} style={btnStyle('#3b82f6')}>Edit</button>
              <button onClick={() => dispatch(deleteReview(review.id))} style={btnStyle('#E50914')}>Delete</button>
            </div>
          )}
          {isOwner && editing && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleUpdate} style={btnStyle('#22c55e')}>Save</button>
              <button onClick={() => setEditing(false)} style={btnStyle('#6b7280')}>Cancel</button>
            </div>
          )}
        </div>
      </div>
      {editing ? (
        <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px',
            padding: '10px', color: '#fff', fontSize: '14px', resize: 'vertical',
            boxSizing: 'border-box', outline: 'none',
          }}
        />
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
          {review.body}
        </p>
      )}
    </div>
  );
}

const btnStyle = (color) => ({
  background: 'none', border: `1px solid ${color}`, color,
  padding: '4px 10px', borderRadius: '4px', fontSize: '12px',
  cursor: 'pointer', fontWeight: 500,
});
