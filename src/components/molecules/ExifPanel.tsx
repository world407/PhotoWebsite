import { Icon } from '@/components/atoms/Icon';
import { getExifFields } from '@/lib/exif';
import type { Work } from '@/types';

interface ExifPanelProps {
  work: Work;
}

export function ExifPanel({ work }: ExifPanelProps) {
  const fields = getExifFields(work);

  if (fields.length === 0) return null;

  return (
    <section aria-label="EXIF 信息">
      <h2 className="flex items-center gap-2 text-h3 text-text-primary mb-4">
        <Icon name="eye" size={22} />
        拍摄参数
      </h2>
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div
            key={field.key}
            className="rounded-card bg-bg-card p-3.5 transition-colors duration-200 hover:bg-bg-card-hover"
          >
            <dt className="text-caption text-text-muted mb-1">{field.label}</dt>
            <dd className="text-body-sm text-text-primary font-medium truncate">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
