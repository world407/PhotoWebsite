import { useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { TagChip } from '@/components/atoms/TagChip';
import type { Work } from '@/types';

interface PhotoInfoProps {
  work: Work;
}

export function PhotoInfo({ work }: PhotoInfoProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDescription = !!work.description && work.description.length > 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formattedDate = formatDate(work.createdAt);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-h2 text-text-primary">{work.title}</h1>

        {(work.location || formattedDate) && (
          <div className="flex flex-wrap items-center gap-4 text-text-secondary text-body-sm">
            {work.location && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="map-pin" size={14} />
                {work.location}
              </span>
            )}
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" size={14} />
                {formattedDate}
              </span>
            )}
          </div>
        )}
      </div>

      {hasDescription && (
        <div>
          <p
            className={`text-body text-text-secondary leading-relaxed ${
              !expanded ? 'line-clamp-3 sm:line-clamp-none' : ''
            }`}
          >
            {work.description}
          </p>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-body-sm text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm sm:hidden"
            aria-expanded={expanded}
          >
            {expanded ? '收起' : '展开'}
          </button>
        </div>
      )}

      {work.tags && work.tags.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="标签">
          {work.tags.map((tag) => (
            <TagChip key={tag} label={tag} interactive={false} />
          ))}
        </div>
      )}
    </div>
  );
}
