import { IconButton } from '@/components/atoms/IconButton';
import { Icon } from '@/components/atoms/Icon';
import { useBackToTop } from '@/lib/hooks';
import { useToast } from '@/lib/toast';

export function FloatingActions() {
  const { visible, scrollToTop } = useBackToTop(500);
  const { toast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      <IconButton
        aria-label="回到顶部"
        size="lg"
        variant="card"
        className={`back-to-top border border-border-subtle ${visible ? 'visible' : ''}`}
        onClick={scrollToTop}
      >
        <Icon name="chevron-up" size={18} />
      </IconButton>

      <IconButton
        aria-label="上传作品"
        size="xl"
        variant="accent"
        className="fab-rotate"
        onClick={() => toast('上传功能即将上线')}
      >
        <Icon name="plus" size={24} />
      </IconButton>
    </div>
  );
}
