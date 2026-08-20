import { useState, useRef, useEffect } from 'react';

const placementStyles = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const Tooltip = ({ children, content, shortcut, placement = 'top', delay = 400 }) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const triggerRef = useRef(null);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (!content) return children;

  return (
    <span
      className="relative inline-flex items-center"
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        role="tooltip"
        className={`absolute z-50 pointer-events-none whitespace-nowrap bg-bg-overlay text-text-primary text-xs px-2.5 py-1 rounded-md border border-border shadow-md flex items-center gap-1.5 transition-all duration-150 ${
          placementStyles[placement] || placementStyles.top
        } ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <span>{content}</span>
        {shortcut && (
          <kbd className="font-mono text-2xs bg-bg-elevated text-text-secondary px-1 py-0.5 rounded border border-border-subtle">
            {shortcut}
          </kbd>
        )}
      </span>
    </span>
  );
};

export default Tooltip;
