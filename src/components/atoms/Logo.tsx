import { Magnet } from '@/components/atoms/Magnet';

interface LogoProps {
  variant?: 'full' | 'minimal';
  className?: string;
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  return (
    <Magnet padding={40} magnetStrength={3}>
      <a href="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
        <span className="inline-block w-2 h-2 rounded-full bg-accent" />
        <span className="text-h3 font-semibold tracking-tight text-text-primary">
          影·迹
          {variant === 'full' && (
            <span className="text-text-muted text-caption font-normal tracking-[0.2em] uppercase ml-1">
              PHOTOGRAPHY
            </span>
          )}
        </span>
      </a>
    </Magnet>
  );
}
