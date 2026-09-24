// Work / Photo types
export interface Work {
  id: number;
  title: string;
  author: string;
  authorId?: number;
  authorAvatar?: string;
  likes: number;
  views?: number;
  tag: WorkTag;
  tags?: string[];
  aspectRatio: number; // width / height for CSS aspect-ratio
  imageUrl: string;
  thumbnailUrl?: string;
  fullUrl?: string;
  description?: string;
  location?: string;
  exif?: ExifData;
  createdAt?: string;
  isFeatured?: boolean;
  color?: string;
}

export type WorkTag = 'all' | 'portrait' | 'landscape' | 'street' | 'architecture' | 'still' | 'nature' | 'travel' | 'blackwhite';

export type SortOption = 'latest' | 'popular' | 'trending';
export type LayoutMode = 'masonry' | 'grid';

export interface ExifData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  focalLength?: string;
  film?: string;
}

// Photographer types
export interface Photographer {
  id: number;
  name: string;
  bio: string;
  worksCount: number;
  followers: string;
  avatarUrl: string;
  isFollowed?: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

// Stats types
export interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

// Button variants
export type ButtonVariant = 'accent' | 'outline' | 'follow' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Icon names
export type IconName =
  | 'search'
  | 'upload'
  | 'user'
  | 'menu'
  | 'close'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-down'
  | 'heart'
  | 'plus'
  | 'weibo'
  | 'instagram'
  | 'twitter'
  | 'arrow-right'
  | 'grid'
  | 'masonry'
  | 'filter'
  | 'eye'
  | 'map-pin'
  | 'calendar'
  | 'fullscreen'
  | 'download'
  | 'share'
  | 'x'
  | 'bookmark'
  | 'bookmark-check'
  | 'image'
  | 'check';
