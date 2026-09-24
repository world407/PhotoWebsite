import {
  Search,
  Upload,
  User,
  Menu,
  X,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  ChevronDown,
  Heart,
  Plus,
  ArrowRight,
  LayoutGrid,
  Columns,
  SlidersHorizontal,
  Eye,
  MapPin,
  Calendar,
  Maximize,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import type { IconName } from '@/types';
import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

// Custom social icons
function WeiboIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  const iconProps = { width: size, height: size, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props };

  switch (name) {
    case 'search':
      return <Search {...iconProps} />;
    case 'upload':
      return <Upload {...iconProps} strokeWidth={2} />;
    case 'user':
      return <User {...iconProps} />;
    case 'menu':
      return <Menu {...iconProps} />;
    case 'close':
    case 'x':
      return <X {...iconProps} strokeWidth={2} />;
    case 'chevron-right':
      return <ChevronRight {...iconProps} strokeWidth={2} />;
    case 'chevron-up':
      return <ChevronUp {...iconProps} strokeWidth={2} />;
    case 'chevron-left':
      return <ChevronLeft {...iconProps} strokeWidth={2} />;
    case 'chevron-down':
      return <ChevronDown {...iconProps} strokeWidth={2} />;
    case 'heart':
      return <Heart {...iconProps} fill="currentColor" strokeWidth={0} />;
    case 'plus':
      return <Plus {...iconProps} strokeWidth={2} />;
    case 'arrow-right':
      return <ArrowRight {...iconProps} strokeWidth={2} />;
    case 'grid':
      return <LayoutGrid {...iconProps} />;
    case 'masonry':
      return <Columns {...iconProps} />;
    case 'filter':
      return <SlidersHorizontal {...iconProps} />;
    case 'eye':
      return <Eye {...iconProps} />;
    case 'map-pin':
      return <MapPin {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'fullscreen':
      return <Maximize {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'share':
      return <Share2 {...iconProps} />;
    case 'bookmark':
      return <Bookmark {...iconProps} />;
    case 'bookmark-check':
      return <BookmarkCheck {...iconProps} />;
    case 'image':
      return <ImageIcon {...iconProps} />;
    case 'check':
      return <Check {...iconProps} strokeWidth={2.5} />;
    case 'weibo':
      return <WeiboIcon {...iconProps} />;
    case 'instagram':
      return <InstagramIcon {...iconProps} />;
    case 'twitter':
      return <TwitterIcon {...iconProps} />;
    default:
      return null;
  }
}
