// components/Avatar.tsx
import { FC } from "react"

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: string | number;
}

const Avatar: FC<AvatarProps> = ({ src, alt = "Avatar", fallback, className = '', size = "80px" }) =>{ 
  const sizeStyle = typeof size === "number" ? `${size}px` : size;
  return (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gray-200 ${className}`}
      style={{ height: sizeStyle, width: sizeStyle }}
    >
      {src ? (
        <img src={src} alt={alt} className="rounded-full object-cover h-full w-full" />
      ) : (
        <span className="text-2xl font-semibold text-gray-500">{fallback}</span>
      )}
    </div>
  );

}
export default Avatar
