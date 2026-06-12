'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({
  rating,
  onChange,
  maxRating = 5,
}: {
  rating: number;
  onChange: (rating: number) => void;
  maxRating?: number;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rate this transcript">
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={rating === value}
          aria-label={`${value} star${value > 1 ? 's' : ''}`}
          className="press rounded p-1 focus-visible:outline-2 focus-visible:outline-ring"
          onMouseEnter={() => setHovered(value)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value)}
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors duration-150',
              value <= (hovered || rating)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground/40',
            )}
          />
        </button>
      ))}
    </div>
  );
}
