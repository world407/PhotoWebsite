import { useState } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { TagChip } from '@/components/atoms/TagChip';
import { tagLabels } from '@/data/mockData';
import type { WorkTag, SortOption, LayoutMode } from '@/types';

interface GalleryToolbarProps {
  activeTag: WorkTag;
  onTagChange: (tag: WorkTag) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'latest', label: '最新' },
  { value: 'popular', label: '最热' },
  { value: 'trending', label: '趋势' },
];

export function GalleryToolbar({
  activeTag,
  onTagChange,
  sortBy,
  onSortChange,
  layoutMode,
  onLayoutChange,
  searchQuery,
  onSearchChange,
  totalCount,
  className = '',
}: GalleryToolbarProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const tags: WorkTag[] = ['all', 'portrait', 'landscape', 'street', 'architecture', 'still', 'nature', 'travel', 'blackwhite'];

  return (
    <div className={`mb-8 ${className}`}>
      {/* Search and controls row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="搜索作品、摄影师、标签..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-bg-card border border-border-subtle rounded-xl py-3 pl-11 pr-4 text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sort dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-bg-card border border-border-subtle rounded-xl text-body-sm text-text-secondary hover:text-text-primary hover:border-accent/30 transition-all"
            >
              {sortOptions.find(o => o.value === sortBy)?.label}
              <Icon name="chevron-down" size={16} />
            </button>
            {showSortDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                <div className="absolute right-0 top-full mt-2 bg-bg-card border border-border-subtle rounded-xl py-2 min-w-[120px] z-20 shadow-card">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-body-sm transition-colors ${
                        sortBy === option.value
                          ? 'text-accent bg-accent/5'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Layout toggle */}
          <div className="flex items-center bg-bg-card border border-border-subtle rounded-xl p-1">
            <button
              onClick={() => onLayoutChange('masonry')}
              className={`p-2.5 rounded-lg transition-all ${
                layoutMode === 'masonry'
                  ? 'bg-accent text-bg-deep'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="瀑布流布局"
              title="瀑布流布局"
            >
              <Icon name="masonry" size={18} />
            </button>
            <button
              onClick={() => onLayoutChange('grid')}
              className={`p-2.5 rounded-lg transition-all ${
                layoutMode === 'grid'
                  ? 'bg-accent text-bg-deep'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="网格布局"
              title="网格布局"
            >
              <Icon name="grid" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-2 items-center">
        {tags.map((tag) => (
          <TagChip
            key={tag}
            label={tagLabels[tag]}
            isActive={activeTag === tag}
            onClick={() => onTagChange(tag)}
          />
        ))}
        
        <span className="ml-auto text-caption text-text-muted">
          {totalCount} 张作品
        </span>
      </div>
    </div>
  );
}
