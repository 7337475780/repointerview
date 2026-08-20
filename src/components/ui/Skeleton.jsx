const Skeleton = ({ className = '', variant = 'rect' }) => {
  const variantStyles = {
    rect: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-3/4',
  };

  return (
    <div
      className={`bg-bg-elevated/80 animate-pulse border border-border-subtle ${
        variantStyles[variant] || variantStyles.rect
      } ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
