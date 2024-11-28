import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  onRate: (rating: number) => void
}

export function StarRating({ onRate }: StarRatingProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer ${
            star <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => {
            setRating(star)
            onRate(star)
          }}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(rating)}
        />
      ))}
    </div>
  )
}

