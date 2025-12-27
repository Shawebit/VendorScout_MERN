import { useState } from 'react';

const StarRating = ({ rating, onRatingChange, interactive = true, size = '1rem', showRatingValue = true }) => {
  const [hoverRating, setHoverRating] = useState(0);

  // Function to render a single star
  const renderStar = (starValue) => {
    const isFilled = starValue <= (hoverRating || rating);
    const starStyle = {
      cursor: interactive ? 'pointer' : 'default',
      fontSize: size,
      color: isFilled ? '#fbbf24' : '#d1d5db',
      margin: '0 2px',
      transition: 'color 0.2s ease',
    };

    return (
      <span
        key={starValue}
        style={starStyle}
        onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
        onMouseEnter={() => interactive && setHoverRating(starValue)}
        onMouseLeave={() => interactive && setHoverRating(0)}
      >
        ★
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(renderStar)}
      {showRatingValue && rating > 0 && (
        <span style={{ marginLeft: '8px', fontSize: '0.9em', color: '#6b7280' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;