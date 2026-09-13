import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';

const RELATIONSHIP_STYLES = {
  REGISTERS: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/15', text: 'text-emerald-400', stroke: '#10B981' },
  ROUTES_TO: { border: 'border-orange-500/40', bg: 'bg-orange-500/15', text: 'text-orange-400', stroke: '#F97316' },
  USES: { border: 'border-amber-500/40', bg: 'bg-amber-500/15', text: 'text-amber-400', stroke: '#F59E0B' },
  CALLS: { border: 'border-blue-500/40', bg: 'bg-blue-500/15', text: 'text-blue-400', stroke: '#3B82F6' },
  PERSISTS_TO: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/15', text: 'text-emerald-400', stroke: '#10B981' },
  AUTHENTICATES_WITH: { border: 'border-rose-500/40', bg: 'bg-rose-500/15', text: 'text-rose-400', stroke: '#F43F5E' },
  CONNECTS_TO: { border: 'border-accent/40', bg: 'bg-accent/15', text: 'text-accent', stroke: '#D4714A' },
  TESTS: { border: 'border-zinc-500/40', bg: 'bg-zinc-500/15', text: 'text-zinc-400', stroke: '#71717A' },
  DEPENDS_ON: { border: 'border-stone-500/40', bg: 'bg-stone-500/15', text: 'text-stone-300', stroke: '#78716C' },
  IMPORTS: { border: 'border-border', bg: 'bg-bg-elevated', text: 'text-text-tertiary', stroke: '#52483F' },
};

const ArchitectureCustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const relationship = data?.relationship || 'IMPORTS';
  const styleConfig = RELATIONSHIP_STYLES[relationship] || RELATIONSHIP_STYLES.IMPORTS;
  const isDimmed = data?.isDimmed;
  const isHighlighted = data?.isHighlighted || selected;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isHighlighted ? '#D4714A' : isDimmed ? '#3A342E' : styleConfig.stroke,
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          strokeDasharray: relationship === 'TESTS' ? '4 3' : relationship === 'DEPENDS_ON' ? '5 4' : undefined,
          transition: 'stroke 0.2s, stroke-width 0.2s',
          opacity: isDimmed ? 0.2 : 1,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            type="button"
            className={`px-2 py-0.5 rounded-md text-3xs font-mono font-semibold border transition-all duration-150 cursor-pointer shadow-xs whitespace-nowrap select-none ${
              isHighlighted
                ? 'bg-accent text-white border-accent ring-2 ring-accent/30 scale-105'
                : `${styleConfig.bg} ${styleConfig.text} ${styleConfig.border} hover:scale-105 hover:bg-bg-surface`
            } ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (data?.onSelectEdge) {
                data.onSelectEdge(data);
              }
            }}
          >
            <span>{relationship.replace(/_/g, ' ')}</span>
            {data?.confidence && (
              <span className="ml-1 opacity-70 font-normal">
                {Math.round(data.confidence * 100)}%
              </span>
            )}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(ArchitectureCustomEdge);
