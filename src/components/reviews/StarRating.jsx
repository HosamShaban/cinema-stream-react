import { useState } from 'react';

export function StarRating({ value = 0, onChange, readOnly = false, size = 20 }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          style={{
            fontSize: `${size}px`,
            color: star <= display ? '#F5C518' : 'rgba(255,255,255,0.2)',
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'color 0.15s, transform 0.15s',
            transform: !readOnly && star <= hovered ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
          }}
        >★</span>
      ))}
    </div>
  );
}
