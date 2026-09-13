import { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode, CheckCircle2, Info } from 'lucide-react';
import Badge from '../ui/Badge';

const CATEGORY_LABELS = {
  framework: 'Core Frameworks',
  frontend: 'Frontend & UI',
  backend: 'Backend & Server',
  database: 'Databases & Drivers',
  orm: 'ORMs & Data Modeling',
  cache: 'Caching Layer',
  auth: 'Authentication & Security',
  api: 'API & Networking',
  styling: 'Styling & Design',
  deployment: 'Deployment & CI/CD',
  language: 'Programming Languages',
  build_tool: 'Build Tools',
};

const TechnologyGrid = ({ technologies = [] }) => {
  const [expandedTech, setExpandedTech] = useState(null);

  if (!technologies || technologies.length === 0) {
    return (
      <div className="text-xs text-text-tertiary p-4 bg-bg-elevated rounded-xl border border-border-subtle">
        No specific third-party frameworks detected. Standard native runtime detected.
      </div>
    );
  }

  // Group by category
  const grouped = technologies.reduce((acc, tech) => {
    const cat = tech.category || 'framework';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tech);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="flex flex-col gap-2.5">
          <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            {CATEGORY_LABELS[category] || category}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((tech) => {
              const isExpanded = expandedTech === tech.name;
              const confidencePercent = Math.round(tech.confidence * 100);

              return (
                <div
                  key={tech.name}
                  className="bg-bg-elevated border border-border-subtle hover:border-border rounded-xl p-4 flex flex-col gap-2 transition-all shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary font-mono">
                        {tech.name}
                      </span>
                      {tech.version && (
                        <span className="text-2xs text-text-tertiary font-mono">
                          v{tech.version}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={
                        tech.confidenceLevel === 'high'
                          ? 'success'
                          : tech.confidenceLevel === 'medium'
                          ? 'info'
                          : 'neutral'
                      }
                      size="xs"
                    >
                      {confidencePercent}% confidence
                    </Badge>
                  </div>

                  <p className="text-xs text-text-secondary leading-snug line-clamp-2">
                    {tech.whyDetected}
                  </p>

                  {/* Expandable Evidence */}
                  {tech.evidence && tech.evidence.length > 0 && (
                    <div className="mt-1 pt-2 border-t border-border-subtle">
                      <button
                        type="button"
                        className="flex items-center justify-between w-full text-2xs font-semibold text-text-tertiary hover:text-accent transition-colors cursor-pointer"
                        onClick={() => setExpandedTech(isExpanded ? null : tech.name)}
                      >
                        <span className="flex items-center gap-1">
                          <FileCode size={12} />
                          <span>{tech.evidence.length} Evidence file(s)</span>
                        </span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 flex flex-col gap-1.5 bg-bg-surface p-2.5 rounded-lg border border-border-subtle">
                          {tech.evidence.map((ev, idx) => (
                            <div key={idx} className="flex flex-col gap-0.5 text-2xs font-mono">
                              <span className="text-text-primary font-semibold truncate">
                                ↳ {ev.filePath}
                              </span>
                              <span className="text-text-tertiary text-3xs">
                                {ev.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechnologyGrid;
