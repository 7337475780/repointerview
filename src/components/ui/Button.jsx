import { motion } from 'framer-motion';

const variantStyles = {
  primary:
    'bg-accent hover:bg-accent-hover active:bg-accent-active text-text-primary shadow-xs border border-accent hover:border-accent-hover',
  secondary:
    'bg-bg-elevated hover:bg-bg-overlay active:bg-bg-surface text-text-primary border border-border hover:border-border-strong',
  ghost:
    'bg-transparent hover:bg-bg-elevated active:bg-bg-surface text-text-secondary hover:text-text-primary border border-transparent',
  danger:
    'bg-error-subtle hover:bg-error/20 active:bg-error/30 text-error border border-error/30',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md font-medium',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg font-medium',
  lg: 'h-11 px-5 text-base gap-2.5 rounded-lg font-semibold',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  return (
    <motion.button
      type={type}
      className={`inline-flex items-center justify-center relative font-sans whitespace-nowrap select-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      {...rest}
    >
      {loading && (
        <span className="animate-spin w-4 h-4 mr-2" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="31.4"
              strokeDashoffset="10"
            />
          </svg>
        </span>
      )}
      {!loading && leftIcon && (
        <span className="inline-flex items-center justify-center flex-shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="leading-none">{children}</span>
      {!loading && rightIcon && (
        <span className="inline-flex items-center justify-center flex-shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </motion.button>
  );
};

export default Button;
