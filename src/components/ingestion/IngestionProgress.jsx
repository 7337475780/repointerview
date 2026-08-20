import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, FileCode, GitBranch, Search, Sparkles } from 'lucide-react';

const STAGES = [
  { id: 'VALIDATING', label: 'Validating GitHub repository URL' },
  { id: 'FETCHING_METADATA', label: 'Connecting to GitHub & fetching metadata' },
  { id: 'FETCHING_TREE', label: 'Mapping recursive Git tree structure' },
  { id: 'SELECTING_FILES', label: 'Scoring code & architecture relevance' },
  { id: 'FETCHING_FILES', label: 'Retrieving key source file contents' },
];

const IngestionProgress = ({ progressEvent }) => {
  const currentStep = progressEvent?.step || 'VALIDATING';
  const stageIndex = STAGES.findIndex(s => s.id === currentStep);
  const activeIndex = stageIndex >= 0 ? stageIndex : STAGES.length - 1;

  return (
    <div className="bg-bg-elevated border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Loader2 size={16} className="text-accent animate-spin" />
          <span className="text-sm font-semibold text-text-primary">
            Ingesting repository from GitHub
          </span>
        </div>
        {progressEvent?.totalFilesToFetch && (
          <span className="font-mono text-xs text-accent font-semibold bg-accent-subtle border border-accent-border px-2.5 py-1 rounded-lg">
            {progressEvent.filesFetched || 0} / {progressEvent.totalFilesToFetch} files
          </span>
        )}
      </div>

      {/* Progressive Step List */}
      <div className="flex flex-col gap-3">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-3 text-xs transition-colors ${
                isDone
                  ? 'text-success font-medium'
                  : isCurrent
                  ? 'text-accent font-semibold'
                  : 'text-text-disabled opacity-40'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 size={14} className="text-success" />
                ) : isCurrent ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin inline-block" />
                ) : (
                  <span className="w-3 h-3 rounded-full border border-border-subtle inline-block" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <span>{stage.label}</span>
                {isCurrent && progressEvent?.currentFilePath && (
                  <span className="font-mono text-2xs text-text-tertiary truncate max-w-md">
                    ↳ {progressEvent.currentFilePath}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live byte counter */}
      {progressEvent?.totalBytesDownloaded !== undefined && progressEvent.totalBytesDownloaded > 0 && (
        <div className="border-t border-border-subtle pt-3 flex items-center justify-between text-2xs font-mono text-text-tertiary">
          <span>Payload downloaded</span>
          <span>{Math.round(progressEvent.totalBytesDownloaded / 1024)} KB</span>
        </div>
      )}
    </div>
  );
};

export default IngestionProgress;
