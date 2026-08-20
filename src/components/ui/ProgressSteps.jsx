import './ProgressSteps.css';

const ProgressSteps = ({ steps, title }) => {
  return (
    <div className="progress-steps">
      {title && <p className="progress-steps__title">{title}</p>}
      <div className="progress-steps__list">
        {steps.map((step, idx) => (
          <div key={idx} className={`progress-step progress-step--${step.status}`}>
            <div className="progress-step__icon" aria-hidden="true">
              {step.status === 'done' && (
                <svg viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {step.status === 'active' && (
                <svg viewBox="0 0 16 16" fill="none" className="progress-step__spinner">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                    strokeDasharray="25" strokeDashoffset="8" />
                </svg>
              )}
              {step.status === 'pending' && (
                <svg viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
              )}
            </div>
            <span className="progress-step__label">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
