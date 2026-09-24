import { Link } from 'react-router-dom';
import { Icon } from '@/components/atoms/Icon';

interface DetailBreadcrumbProps {
  title: string;
  onBack?: () => void;
}

export function DetailBreadcrumb({ title, onBack }: DetailBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-sm text-text-muted">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
          aria-label="返回"
        >
          <Icon name="chevron-left" size={14} />
          <span className="md:hidden">返回</span>
        </button>
      ) : (
        <Link
          to="/"
          className="hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
        >
          首页
        </Link>
      )}

      <Icon name="chevron-right" size={14} className="opacity-50 hidden sm:block" />
      <Link
        to="/gallery"
        className="hidden sm:block hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 rounded-sm"
      >
        探索
      </Link>
      <Icon name="chevron-right" size={14} className="opacity-50 hidden sm:block" />
      <span
        className="text-text-secondary truncate max-w-[200px] sm:max-w-xs hidden sm:inline"
        aria-current="page"
      >
        {title}
      </span>
    </nav>
  );
}
