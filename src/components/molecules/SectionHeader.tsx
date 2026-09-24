import { Icon } from '@/components/atoms/Icon';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({ title, description, actionText, actionHref, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between mb-8 ${className}`}>
      <div>
        <h2 className="text-h2 font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-caption text-text-secondary mt-2">{description}</p>}
      </div>
      {actionText && actionHref && (
        <a
          href={actionHref}
          className="text-body-sm text-accent hover:text-accent-hover transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          {actionText}
          <Icon name="chevron-right" size={16} />
        </a>
      )}
    </div>
  );
}
