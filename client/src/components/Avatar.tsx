// components/Avatar.tsx
import { FC } from "react"

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: () => string
  className?: string
}

const Avatar: FC<AvatarProps> = ({ src, alt, fallback = () => 'JD', className = '' }) => (
  <div
    className={`relative flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 ${className}`}
  >
    {src ? (
      <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
    ) : (
      <span className="text-2xl font-semibold text-gray-500">{fallback()}</span>
    )}
  </div>
);

export default Avatar
