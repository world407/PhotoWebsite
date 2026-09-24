import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkCard } from '@/components/molecules/WorkCard';
import { GalleryToolbar } from '@/components/molecules/GalleryToolbar';
import { useWorks } from '@/lib/works';
import { saveScrollPosition, restoreScrollPosition } from '@/lib/hooks';
import type { WorkTag, SortOption, LayoutMode } from '@/types';

const PAGE_SIZE = 9;

const WORK_TAGS: WorkTag[] = ['all', 'portrait', 'landscape', 'street', 'architecture', 'still', 'nature', 'travel', 'blackwhite'];
const SORT_OPTIONS: SortOption[] = ['latest', 'popular', 'trending'];

function isWorkTag(v: string | null): v is WorkTag {
  return v !== null && (WORK_TAGS as string[]).includes(v);
}
function isSortOption(v: string | null): v is SortOption {
  return v !== null && (SORT_OPTIONS as string[]).includes(v);
}
function isLayoutMode(v: string | null): v is LayoutMode {
  return v === 'masonry' || v === 'grid';
}

export function Gallery() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { works } = useWorks();

  const activeTag: WorkTag = isWorkTag(searchParams.get('tag')) ? (searchParams.get('tag') as WorkTag) : 'all';
  const sortBy: SortOption = isSortOption(searchParams.get('sort')) ? (searchParams.get('sort') as SortOption) : 'latest';
  const layoutMode: LayoutMode = isLayoutMode(searchParams.get('layout')) ? (searchParams.get('layout') as LayoutMode) : 'masonry';
  const searchQuery = searchParams.get('q') ?? '';
  const showFeaturedOnly = searchParams.get('featured') === '1';
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const updateParam = useCallback((key: string, value: string, defaultValue: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === defaultValue) next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setTag = useCallback((tag: WorkTag) => updateParam('tag', tag, 'all'), [updateParam]);
  const setSort = useCallback((sort: SortOption) => updateParam('sort', sort, 'latest'), [updateParam]);
  const setLayout = useCallback((mode: LayoutMode) => updateParam('layout', mode, 'masonry'), [updateParam]);
  const setSearch = useCallback((q: string) => updateParam('q', q, ''), [updateParam]);
  const setFeatured = useCallback((f: boolean) => updateParam('featured', f ? '1' : '0', '0'), [updateParam]);

  // 单次导航重置全部筛选，避免同一事件内多次 setSearchParams 函数式更新相互覆盖
  const clearAllFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Filter and sort works
  const filteredWorks = useMemo(() => {
    let result = [...works];

    // Filter by tag
    if (activeTag !== 'all') {
      result = result.filter(w => w.tag === activeTag);
    }

    // Filter by featured
    if (showFeaturedOnly) {
      result = result.filter(w => w.isFeatured);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(w =>
        w.title.toLowerCase().includes(query) ||
        w.author.toLowerCase().includes(query) ||
        w.location?.toLowerCase().includes(query) ||
        w.tags?.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'trending':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'latest':
      default:
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
    }

    return result;
  }, [works, activeTag, sortBy, searchQuery, showFeaturedOnly]);

  // Reset pagination whenever filter/sort/search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTag, sortBy, searchQuery, showFeaturedOnly]);

  const visibleWorks = useMemo(() => filteredWorks.slice(0, visibleCount), [filteredWorks, visibleCount]);
  const hasMore = visibleCount < filteredWorks.length;

  const handleWorkClick = useCallback((workId: number) => {
    saveScrollPosition();
    navigate(`/photo/${workId}`);
  }, [navigate]);

  // Restore scroll position when returning from detail page
  useEffect(() => {
    const saved = restoreScrollPosition();
    if (saved > 0) {
      window.scrollTo({ top: saved, behavior: 'auto' });
    }
  }, []);

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-h2 font-bold text-text-primary">作品探索</h1>
          <p className="text-body text-text-secondary mt-2">发现精彩的摄影作品</p>
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setFeatured(!showFeaturedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-body-sm transition-all ${
              showFeaturedOnly
                ? 'bg-accent text-bg-deep'
                : 'bg-bg-card border border-border-subtle text-text-secondary hover:border-accent/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            精选作品
          </button>
        </div>

        {/* Toolbar */}
        <GalleryToolbar
          activeTag={activeTag}
          onTagChange={setTag}
          sortBy={sortBy}
          onSortChange={setSort}
          layoutMode={layoutMode}
          onLayoutChange={setLayout}
          searchQuery={searchQuery}
          onSearchChange={setSearch}
          totalCount={filteredWorks.length}
        />

        {/* Works grid */}
        {filteredWorks.length > 0 ? (
          <div
            key={`${activeTag}-${sortBy}-${layoutMode}-${showFeaturedOnly}`}
            className={layoutMode === 'masonry' ? 'waterfall' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'}
          >
            {visibleWorks.map((work, index) => (
              <WorkCard
                key={work.id}
                work={work}
                index={index}
                onClick={() => handleWorkClick(work.id)}
                showAuthor={layoutMode === 'grid'}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-body text-text-secondary">没有找到匹配的作品</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 text-accent hover:text-accent-hover text-body-sm"
            >
              清除筛选条件
            </button>
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="px-8 py-3 border border-border-subtle rounded-xl text-body text-text-secondary hover:border-accent/30 hover:text-accent transition-all"
            >
              加载更多
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
