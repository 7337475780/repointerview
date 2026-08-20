import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

const IngestionError = ({ error, onRetry }) => {
  return (
    <div className="bg-error/10 border border-error-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-error/20 flex items-center justify-center text-error flex-shrink-0 mt-0.5">
          <AlertCircle size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-text-primary">Connection & Ingestion Failed</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-error-border pt-4">
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={13} />} onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default IngestionError;
