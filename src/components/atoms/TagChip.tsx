interface TagChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export function TagChip({
  label,
  isActive = false,
  onClick,
  className = '',
  interactive = true,
}: TagChipProps) {
  const baseClasses = `tag-chip px-4 py-1.5 rounded-full text-caption font-medium ${
    isActive ? 'active text-text-primary' : 'text-text-secondary'
  } ${className}`;

  if (!interactive) {
    return <span className={baseClasses}>{label}</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClasses}
    >
      {label}
    </button>
  );
}
