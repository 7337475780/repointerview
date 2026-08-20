import { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`w-full bg-bg-elevated border rounded-xl text-sm text-text-primary placeholder:text-text-disabled outline-none transition-all duration-150 ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-error focus:ring-2 focus:ring-error/20'
                : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/20'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error font-medium">{error}</p>}
        {!error && hint && <p className="text-xs text-text-disabled">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
