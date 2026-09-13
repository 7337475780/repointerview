import { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode,
  Shield,
  Layers,
  Cloud,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import Badge from '../ui/Badge';

const FindingInspector = ({ intelligence }) => {
  const [openSection, setOpenSection] = useState('signals');

  if (!intelligence) return null;

  const {
    architectureSignals = [],
    entryPoints = [],
    authentication,
    deployment,
    externalServices = [],
    warnings = [],
  } = intelligence;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles size={18} className="text-accent" />
          <div>
            <h3 className="text-base font-bold text-text-primary">
              What RepoInterview Discovered
            </h3>
            <p className="text-xs text-text-tertiary">
              Deterministic project intelligence with traceable evidence trails
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Architecture Signals Section */}
        {architectureSignals.length > 0 && (
          <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-elevated/40">
            <button
              type="button"
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-elevated transition-colors"
              onClick={() => setOpenSection(openSection === 'signals' ? '' : 'signals')}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-accent" />
                <span className="text-xs font-bold text-text-primary">
                  Architecture Patterns & Signals ({architectureSignals.length})
                </span>
              </div>
              {openSection === 'signals' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openSection === 'signals' && (
              <div className="p-4 bg-bg-surface border-t border-border-subtle flex flex-col gap-3">
                {architectureSignals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-elevated p-3 rounded-lg border border-border-subtle flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary font-mono">
                        {sig.type}
                      </span>
                      <Badge variant="success" size="xs">
                        {Math.round(sig.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary">{sig.description}</p>
                    {sig.evidence && sig.evidence.length > 0 && (
                      <div className="flex flex-col gap-1 pt-1 border-t border-border-subtle text-2xs font-mono text-text-tertiary">
                        {sig.evidence.map((ev, eIdx) => (
                          <div key={eIdx} className="flex items-center gap-1.5 truncate">
                            <FileCode size={11} className="text-accent flex-shrink-0" />
                            <span className="truncate">{ev.filePath} · {ev.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Entry Points Section */}
        {entryPoints.length > 0 && (
          <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-elevated/40">
            <button
              type="button"
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-elevated transition-colors"
              onClick={() => setOpenSection(openSection === 'entry' ? '' : 'entry')}
            >
              <div className="flex items-center gap-2.5">
                <Terminal size={16} className="text-accent" />
                <span className="text-xs font-bold text-text-primary">
                  Application Entry Points ({entryPoints.length})
                </span>
              </div>
              {openSection === 'entry' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openSection === 'entry' && (
              <div className="p-4 bg-bg-surface border-t border-border-subtle flex flex-col gap-2.5">
                {entryPoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="bg-bg-elevated p-3 rounded-lg border border-border-subtle flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCode size={13} className="text-accent flex-shrink-0" />
                      <span className="text-text-primary font-bold truncate">{ep.path}</span>
                    </div>
                    <span className="text-2xs text-text-tertiary truncate ml-2">
                      {ep.whyDetected}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security & Authentication */}
        {authentication && (
          <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-elevated/40">
            <button
              type="button"
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-elevated transition-colors"
              onClick={() => setOpenSection(openSection === 'auth' ? '' : 'auth')}
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-accent" />
                <span className="text-xs font-bold text-text-primary">
                  Authentication & Security ({authentication.detected ? 'Verified' : 'Not detected'})
                </span>
              </div>
              {openSection === 'auth' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openSection === 'auth' && (
              <div className="p-4 bg-bg-surface border-t border-border-subtle flex flex-col gap-2 text-xs">
                <p className="text-text-secondary">{authentication.whyDetected}</p>
                {authentication.strategies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {authentication.strategies.map(s => (
                      <Badge key={s} variant="info" size="xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Deployment & Infrastructure */}
        {deployment && deployment.platforms.length > 0 && (
          <div className="border border-border-subtle rounded-xl overflow-hidden bg-bg-elevated/40">
            <button
              type="button"
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-bg-elevated transition-colors"
              onClick={() => setOpenSection(openSection === 'deploy' ? '' : 'deploy')}
            >
              <div className="flex items-center gap-2.5">
                <Cloud size={16} className="text-accent" />
                <span className="text-xs font-bold text-text-primary">
                  Deployment & Infrastructure ({deployment.platforms.join(', ')})
                </span>
              </div>
              {openSection === 'deploy' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {openSection === 'deploy' && (
              <div className="p-4 bg-bg-surface border-t border-border-subtle flex flex-col gap-2 text-xs">
                <p className="text-text-secondary">{deployment.whyDetected}</p>
                <div className="flex flex-col gap-1 text-2xs font-mono text-text-tertiary">
                  {deployment.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <FileCode size={11} className="text-accent" />
                      <span>{ev.filePath} · {ev.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Warnings & Scope Limitations */}
        {warnings.length > 0 && (
          <div className="border border-warning-border/50 rounded-xl overflow-hidden bg-warning/5">
            <div className="p-4 flex items-start gap-2.5 text-xs text-text-secondary">
              <AlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-text-primary">Analysis Notes & Uncertainties</span>
                {warnings.map((w, idx) => (
                  <p key={idx} className="text-2xs text-text-tertiary">
                    • {w.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingInspector;
