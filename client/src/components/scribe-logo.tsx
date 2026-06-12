import Link from 'next/link';
import { cn } from '@/lib/utils';

export function ScribeLogo({ className, href = '/' }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn('group flex items-center gap-2.5', className)}>
      <span className="flex h-8 w-8 items-end justify-center gap-[3px] rounded-lg bg-primary/15 p-[7px]">
        <span className="h-full w-[3px] rounded-full bg-primary [transform:scaleY(0.45)] transition-transform duration-300 group-hover:[transform:scaleY(0.8)]" />
        <span className="h-full w-[3px] rounded-full bg-primary transition-transform duration-300 group-hover:[transform:scaleY(0.6)]" />
        <span className="h-full w-[3px] rounded-full bg-primary [transform:scaleY(0.6)] transition-transform duration-300 group-hover:[transform:scaleY(1)]" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Scribe<span className="text-primary">X</span>
      </span>
    </Link>
  );
}
