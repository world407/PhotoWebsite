import { PulseDot } from '@/components/atoms/PulseDot';

interface AnnouncementBadgeProps {
  text: string;
  className?: string;
}

export function AnnouncementBadge({ text, className = '' }: AnnouncementBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle bg-bg-card/50 text-caption text-text-secondary hover:border-accent/50 cursor-pointer transition-colors ${className}`}>
      <PulseDot />
      {text}
    </div>
  );
}
