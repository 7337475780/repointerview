import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, GitBranch, Star, FileCode, AlertTriangle, ArrowRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const IngestionSuccess = ({ result, onOpenWorkspace }) => {
  const [showFiles, setShowFiles] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);

  const { repository, metadata, stats, warnings, sourceFiles } = result;

  return (
    <motion.div
      className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6 shadow-sm"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Banner */}
      <div className="flex items-start justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-subtle border border-success-border flex items-center justify-center text-success flex-shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold font-mono text-text-primary">
                {repository.fullName}
              </h2>
              <Badge variant={warnings.length > 0 ? 'warning' : 'success'} size="xs">
                {warnings.length > 0 ? 'Ready with warnings' : 'Ready for analysis'}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-xl">
              {metadata.description || 'Repository connected and ready for interview intelligence.'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
          <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            Discovered Files
          </span>
          <span className="font-mono text-lg font-bold text-text-primary">
            {stats.totalDiscoveredFiles}
          </span>
        </div>

        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
          <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            Selected for Analysis
          </span>
          <span className="font-mono text-lg font-bold text-accent">
            {stats.fetchedFilesCount} <span className="text-xs text-text-disabled">/ {stats.selectedFilesCount}</span>
          </span>
        </div>

        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
          <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            Source Ingested
          </span>
          <span className="font-mono text-lg font-bold text-text-primary">
            {Math.round(stats.totalSourceBytes / 1024)} KB
          </span>
        </div>

        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-1">
          <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            Primary Stack
          </span>
          <span className="font-mono text-sm font-semibold text-text-primary truncate">
            {metadata.primaryLanguage}
          </span>
        </div>
      </div>

      {/* Collapsible Selected Files Inspector */}
      <div className="border border-border-subtle rounded-xl overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between p-3.5 bg-bg-elevated hover:bg-bg-overlay text-left text-xs font-semibold text-text-secondary transition-colors cursor-pointer"
          onClick={() => setShowFiles(s => !s)}
        >
          <div className="flex items-center gap-2">
            <FileCode size={14} className="text-accent" />
            <span>Inspect {sourceFiles.length} Selected Source Files</span>
          </div>
          {showFiles ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showFiles && (
          <div className="p-3 bg-bg-surface flex flex-col gap-1 max-h-60 overflow-y-auto border-t border-border-subtle divide-y divide-border-subtle">
            {sourceFiles.map(file => (
              <div key={file.path} className="py-1.5 flex items-center justify-between text-xs font-mono">
                <span className="text-text-primary truncate">{file.path}</span>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  <span className="text-2xs text-text-disabled">{Math.round(file.size / 1024 * 10) / 10} KB</span>
                  <span className="text-2xs bg-bg-elevated px-1.5 py-0.5 rounded text-accent font-semibold">
                    score {file.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warnings Drawer if any */}
      {warnings.length > 0 && (
        <div className="border border-warning-border rounded-xl overflow-hidden bg-warning/5">
          <button
            type="button"
            className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-warning transition-colors cursor-pointer"
            onClick={() => setShowWarnings(s => !s)}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>{warnings.length} Files Skipped (within budget limits)</span>
            </div>
            {showWarnings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showWarnings && (
            <div className="p-3 bg-bg-surface flex flex-col gap-1.5 border-t border-warning-border">
              {warnings.map(w => (
                <div key={w.path} className="text-xs font-mono text-text-secondary flex items-start gap-2">
                  <span className="text-warning">›</span>
                  <span className="truncate flex-1">{w.path}</span>
                  <span className="text-2xs text-text-disabled">{w.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="border-t border-border-subtle pt-6 flex items-center justify-between">
        <span className="text-xs text-text-tertiary">
          Ingestion complete in {Math.round(stats.durationMs / 100) / 10}s. Ready for Phase 3 analysis.
        </span>
        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight size={15} />}
          onClick={onOpenWorkspace}
        >
          Open Project Workspace
        </Button>
      </div>
    </motion.div>
  );
};

export default IngestionSuccess;
