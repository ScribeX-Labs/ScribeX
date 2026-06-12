import { cn } from '@/lib/utils';

const HEIGHTS = [
  18, 32, 24, 48, 64, 40, 72, 56, 88, 64, 96, 72, 56, 80, 44, 68, 92, 60, 76, 48,
  84, 56, 36, 64, 28, 52, 70, 42, 58, 30, 46, 22, 38, 54, 26, 44, 60, 34, 20, 28,
];

// decorative animated waveform; animate=false renders a static frozen frame
export function Waveform({
  className,
  animate = true,
  bars = HEIGHTS.length,
}: {
  className?: string;
  animate?: boolean;
  bars?: number;
}) {
  return (
    <div aria-hidden className={cn('flex h-24 items-center gap-[5px]', className)}>
      {HEIGHTS.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className={cn('w-[3px] rounded-full bg-primary/60', animate && 'wave-bar')}
          style={{
            height: `${h}%`,
            animationDelay: animate ? `${(i % 7) * 130}ms` : undefined,
            animationDuration: animate ? `${900 + (i % 5) * 180}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}
