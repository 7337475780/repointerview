const LanguageBreakdown = ({ languages = [] }) => {
  if (!languages || languages.length === 0) return null;

  return (
    <div className="bg-bg-elevated border border-border-subtle rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
          Source Code Distribution
        </span>
        <span className="text-2xs font-mono text-text-tertiary">
          {languages.reduce((acc, l) => acc + l.fileCount, 0)} source file(s)
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-bg-surface border border-border-subtle">
        {languages.map((lang) => (
          <div
            key={lang.language}
            style={{
              width: `${Math.max(lang.percentage, 2)}%`,
              backgroundColor: lang.color || '#60A5FA',
            }}
            title={`${lang.language}: ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Legend Chips */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {languages.map((lang) => (
          <div key={lang.language} className="flex items-center gap-1.5 text-xs font-mono">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color || '#60A5FA' }}
            />
            <span className="text-text-primary font-medium">{lang.language}</span>
            <span className="text-text-tertiary text-2xs">{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageBreakdown;
