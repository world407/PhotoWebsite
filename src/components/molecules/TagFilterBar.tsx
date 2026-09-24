import { TagChip } from '@/components/atoms/TagChip';
import { tagLabels } from '@/data/mockData';
import type { WorkTag } from '@/types';

interface TagFilterBarProps {
  activeTag: WorkTag;
  onTagChange: (tag: WorkTag) => void;
  className?: string;
}

const tags: WorkTag[] = ['all', 'portrait', 'landscape', 'street', 'architecture', 'still'];

export function TagFilterBar({ activeTag, onTagChange, className = '' }: TagFilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 mb-10 ${className}`}>
      {tags.map((tag) => (
        <TagChip
          key={tag}
          label={tagLabels[tag]}
          isActive={activeTag === tag}
          onClick={() => onTagChange(tag)}
        />
      ))}
    </div>
  );
}
