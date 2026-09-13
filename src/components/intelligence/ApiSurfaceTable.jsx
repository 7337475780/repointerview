import { Globe, FileCode } from 'lucide-react';
import Badge from '../ui/Badge';

const METHOD_COLORS = {
  GET: 'success',
  POST: 'info',
  PUT: 'warning',
  DELETE: 'danger',
  PATCH: 'warning',
  ALL: 'neutral',
  DYNAMIC: 'neutral',
};

const ApiSurfaceTable = ({ apiSurface }) => {
  if (!apiSurface || !apiSurface.detected || apiSurface.routes.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Globe size={18} className="text-accent" />
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Statically Detected API Surface ({apiSurface.endpointsCount})
            </h3>
            <p className="text-xs text-text-tertiary">
              Framework: {apiSurface.framework || 'REST API Routes'}
            </p>
          </div>
        </div>
        <span className="text-2xs font-mono text-text-tertiary bg-bg-elevated px-2.5 py-1 rounded border border-border-subtle">
          Deterministic extraction
        </span>
      </div>

      <div className="border border-border-subtle rounded-xl overflow-hidden divide-y divide-border-subtle max-h-72 overflow-y-auto">
        {apiSurface.routes.map((route, idx) => (
          <div
            key={idx}
            className="p-3 bg-bg-elevated/40 hover:bg-bg-elevated flex items-center justify-between gap-4 text-xs font-mono transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant={METHOD_COLORS[route.method] || 'neutral'} size="xs">
                {route.method}
              </Badge>
              <span className="text-text-primary font-semibold truncate">{route.path}</span>
            </div>
            <div className="flex items-center gap-2 text-2xs text-text-tertiary truncate">
              <FileCode size={12} className="flex-shrink-0" />
              <span className="truncate">{route.filePath}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiSurfaceTable;
