import { useState } from 'react'
import { Star } from 'lucide-react'

export interface StarRatingProps {
  maxRating?: number;
  rating?: number;
  onChange: (rating: number) => void;
  size?: number;
  onRate?: (rating: number) => void; // For backward compatibility
}

export function StarRating({
  maxRating = 5,
  rating: initialRating = 0,
  onChange,
  size = 24,
  onRate,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  // Handle the rating change
  const handleRate = (value: number) => {
    setRating(value);
    onChange(value);
    if (onRate) onRate(value); // For backward compatibility
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          className={`cursor-pointer transition-colors ${
            star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
          size={size}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        />
      ))}
    </div>
  );
}

