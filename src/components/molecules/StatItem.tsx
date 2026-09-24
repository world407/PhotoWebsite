import { useCounter } from '@/lib/hooks';

interface StatItemProps {
  value: number;
  label: string;
  delay?: number;
}

export function StatItem({ value, label, delay = 0 }: StatItemProps) {
  const { ref, displayValue } = useCounter(value, 1800);

  return (
    <div style={{ transitionDelay: `${delay}ms` }}>
      <div ref={ref} className="text-stat font-bold text-accent">
        {displayValue}
      </div>
      <div className="text-caption text-text-muted mt-1">{label}</div>
    </div>
  );
}
