import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center p-12 bg-bg-surface/50 border border-border rounded-2xl max-w-lg mx-auto ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {icon && (
        <div
          className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-text-tertiary mb-4 shadow-xs"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-xs text-text-secondary leading-relaxed max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
