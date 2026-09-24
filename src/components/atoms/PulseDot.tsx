interface PulseDotProps {
  className?: string;
}

export function PulseDot({ className = '' }: PulseDotProps) {
  return <span className={`w-2 h-2 rounded-full bg-accent animate-pulse ${className}`} />;
}
