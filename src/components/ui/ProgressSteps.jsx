const ProgressSteps = ({ steps, title }) => {
  return (
    <div className="flex flex-col gap-3">
      {title && <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">{title}</p>}
      <div className="flex flex-col gap-2.5">
        {steps.map((step, idx) => {
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';

          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <div
                className={`w-4 h-4 flex-shrink-0 flex items-center justify-center ${
                  isDone
                    ? 'text-success'
                    : isActive
                    ? 'text-accent animate-spin'
                    : 'text-text-disabled'
                }`}
                aria-hidden="true"
              >
                {isDone && (
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {isActive && (
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="25"
                      strokeDashoffset="8"
                    />
                  </svg>
                )}
                {isPending && (
                  <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                  </svg>
                )}
              </div>
              <span
                className={`font-mono text-xs ${
                  isDone
                    ? 'text-text-primary'
                    : isActive
                    ? 'text-accent font-medium'
                    : 'text-text-disabled'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
