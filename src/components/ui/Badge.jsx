const variantStyles = {
  neutral: 'bg-bg-elevated text-text-secondary border-border-subtle',
  accent: 'bg-accent-subtle text-accent border-accent/20',
  success: 'bg-success-subtle text-success border-success/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
  error: 'bg-error-subtle text-error border-error/20',
  info: 'bg-info-subtle text-info border-info/20',
};

const dotStyles = {
  neutral: 'bg-text-tertiary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
};

const sizeStyles = {
  xs: 'text-2xs px-1.5 py-0.5 font-medium',
  sm: 'text-xs px-2 py-0.5 font-medium',
  md: 'text-xs px-2.5 py-1 font-semibold tracking-wide uppercase',
};

const Badge = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border leading-none whitespace-nowrap transition-colors duration-150 ${variantStyles[variant] || variantStyles.neutral} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotStyles[variant] || dotStyles.neutral}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
