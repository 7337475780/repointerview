import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Layout,
  Server,
  Database,
  ShieldCheck,
  Layers,
  Cloud,
  Cpu,
  FileCode,
  GitFork,
  Terminal,
  Package,
  Workflow,
} from 'lucide-react';

const NODE_CONFIG = {
  frontend: { icon: Layout, border: 'border-sky-500/40', bg: 'bg-sky-500/10', text: 'text-sky-400', label: 'CLIENT' },
  server: { icon: Server, border: 'border-accent/50', bg: 'bg-accent/10', text: 'text-accent', label: 'SERVER' },
  api: { icon: Server, border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'API' },
  router: { icon: GitFork, border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'ROUTER' },
  middleware: { icon: Workflow, border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'MIDDLEWARE' },
  controller: { icon: Terminal, border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'CONTROLLER' },
  service: { icon: Layers, border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-400', label: 'SERVICE' },
  database: { icon: Database, border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'DATABASE' },
  cache: { icon: Cpu, border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'CACHE' },
  auth: { icon: ShieldCheck, border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', label: 'AUTH' },
  external: { icon: Cloud, border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', label: 'EXTERNAL' },
  shared_library: { icon: Package, border: 'border-stone-500/40', bg: 'bg-stone-500/10', text: 'text-stone-300', label: 'LIBRARY' },
  test: { icon: FileCode, border: 'border-zinc-500/40', bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'TEST' },
  deployment: { icon: Cloud, border: 'border-teal-500/40', bg: 'bg-teal-500/10', text: 'text-teal-400', label: 'DEVOPS' },
  storage: { icon: Database, border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'STORAGE' },
};

const ArchitectureCustomNode = ({ data, selected }) => {
  const type = data.type || 'service';
  const config = NODE_CONFIG[type] || NODE_CONFIG.service;
  const Icon = config.icon;
  const isDimmed = data.isDimmed;
  const isHighlighted = data.isHighlighted;

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 cursor-pointer select-none min-w-[220px] max-w-[260px] shadow-sm backdrop-blur-sm ${
        selected || isHighlighted
          ? 'bg-bg-surface border-accent ring-2 ring-accent/30 shadow-md scale-[1.02]'
          : 'bg-bg-surface/95 border-border hover:border-border-strong hover:bg-bg-surface hover:shadow-xs'
      } ${isDimmed ? 'opacity-30 grayscale-[40%]' : 'opacity-100'}`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-accent !border !border-bg-base !rounded-full opacity-70 hover:opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-accent !border !border-bg-base !rounded-full opacity-70 hover:opacity-100"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} ${config.text} border ${config.border}`}>
            <Icon size={14} />
          </div>
          <span className="font-mono text-xs font-bold text-text-primary truncate">
            {data.label}
          </span>
        </div>
        <span className={`text-3xs font-mono font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${config.bg} ${config.text} ${config.border}`}>
          {config.label}
        </span>
      </div>

      {/* Node Description */}
      {data.description && (
        <p className="text-2xs text-text-secondary line-clamp-2 leading-relaxed mb-3">
          {data.description}
        </p>
      )}

      {/* Node Footer: Evidence Count & Confidence Pill */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-3xs font-mono text-text-tertiary">
        <span>
          {data.evidenceFiles?.length ? `${data.evidenceFiles.length} file(s)` : 'Verified component'}
        </span>
        <span className="text-accent font-semibold bg-accent-subtle/50 px-1.5 py-0.5 rounded border border-accent-border/40">
          {data.confidence ? `${Math.round(data.confidence * 100)}%` : '95%'}
        </span>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-accent !border !border-bg-base !rounded-full opacity-70 hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-accent !border !border-bg-base !rounded-full opacity-70 hover:opacity-100"
      />
    </div>
  );
};

export default memo(ArchitectureCustomNode);
