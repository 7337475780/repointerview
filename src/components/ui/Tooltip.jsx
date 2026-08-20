import { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ children, content, shortcut, placement = 'top', delay = 400 }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

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
      className="tooltip-wrapper"
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <span
        ref={tooltipRef}
        role="tooltip"
        className={`tooltip tooltip--${placement} ${visible ? 'tooltip--visible' : ''}`}
      >
        <span className="tooltip__content">{content}</span>
        {shortcut && <kbd className="tooltip__shortcut">{shortcut}</kbd>}
      </span>
    </span>
  );
};

export default Tooltip;
