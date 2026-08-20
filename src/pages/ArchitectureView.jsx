import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ARCHITECTURE_NODES, ARCHITECTURE_EDGES, QUESTIONS } from '../data/fixtures';
import Badge from '../components/ui/Badge';

const NODE_TYPE_COLORS = {
  frontend: '#4ADE80',
  api: '#D4714A',
  service: '#FBBF24',
  database: '#A78BFA',
  cache: '#F87171',
  external: '#60A5FA',
};

const NODE_TYPE_LABELS = {
  frontend: 'Frontend',
  api: 'API',
  service: 'Service',
  database: 'Database',
  cache: 'Cache',
  external: 'External',
};

const VIEWBOX_W = 800;
const VIEWBOX_H = 480;

const positionedNodes = ARCHITECTURE_NODES.map(n => ({
  ...n,
  vx: n.x,
  vy: n.y,
}));

const getNode = id => positionedNodes.find(n => n.id === id);

const ArchitectureView = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();

  const isEdgeHighlighted = edge => {
    if (!hoveredNode) return false;
    return edge.from === hoveredNode || edge.to === hoveredNode;
  };

  const isNodeConnected = nodeId => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    return ARCHITECTURE_EDGES.some(
      e => (e.from === hoveredNode && e.to === nodeId) || (e.to === hoveredNode && e.from === nodeId)
    );
  };

  const selectedNodeData = positionedNodes.find(n => n.id === selectedNode);
  const relatedQuestions = selectedNode
    ? QUESTIONS.filter(q =>
        q.tags.some(t => selectedNode.includes(t) || t.includes(selectedNode.replace('postgres', 'database')))
      ).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">System Design</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Project architecture map</h1>
          <p className="text-sm text-text-tertiary mt-2">
            Interactive topology inferred from repository AST and dependency graph. Hover to trace relationships.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 bg-bg-surface border border-border rounded-xl px-4 py-2.5 shadow-xs">
          {Object.entries(NODE_TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
              {NODE_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      {/* Canvas and Panel Grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className={`bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm relative h-[520px] transition-all duration-300 ${
            selectedNodeData ? 'lg:col-span-8' : 'lg:col-span-12'
          }`}
        >
          <svg
            className="w-full h-full block"
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            width="100%"
            height="100%"
            aria-label="Architecture diagram"
            role="img"
          >
            {/* Edges */}
            {ARCHITECTURE_EDGES.map((edge, i) => {
              const a = getNode(edge.from);
              const b = getNode(edge.to);
              if (!a || !b) return null;
              const highlighted = isEdgeHighlighted(edge);
              const color = NODE_TYPE_COLORS[a.type] || '#B0A49A';
              return (
                <line
                  key={i}
                  x1={a.vx}
                  y1={a.vy}
                  x2={b.vx}
                  y2={b.vy}
                  stroke={color}
                  strokeWidth={highlighted ? 2 : 1}
                  strokeOpacity={highlighted ? 0.75 : hoveredNode ? 0.08 : 0.25}
                  strokeDasharray={highlighted ? undefined : '5 3'}
                  style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
                />
              );
            })}

            {/* Nodes */}
            {positionedNodes.map(node => {
              const color = NODE_TYPE_COLORS[node.type] || '#B0A49A';
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id;
              const connected = isNodeConnected(node.id);
              return (
                <g
                  key={node.id}
                  style={{
                    cursor: 'pointer',
                    opacity: connected ? 1 : 0.18,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(s => (s === node.id ? null : node.id))}
                  role="button"
                  aria-label={`${node.label}: ${node.description}`}
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedNode(s => (s === node.id ? null : node.id))}
                >
                  {/* Outer glow ring (hover) */}
                  {(isHovered || isSelected) && (
                    <circle cx={node.vx} cy={node.vy} r={30} fill={color} fillOpacity={0.08} />
                  )}
                  {/* Selected ring */}
                  {isSelected && (
                    <circle cx={node.vx} cy={node.vy} r={22} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.5} />
                  )}
                  {/* Main circle */}
                  <circle
                    cx={node.vx}
                    cy={node.vy}
                    r={18}
                    fill={`${color}1A`}
                    stroke={color}
                    strokeWidth={isHovered || isSelected ? 2 : 1.2}
                    strokeOpacity={isHovered || isSelected ? 1 : 0.6}
                  />
                  {/* Center dot */}
                  <circle cx={node.vx} cy={node.vy} r={5} fill={color} fillOpacity={0.9} />

                  {/* Label */}
                  <text
                    x={node.vx}
                    y={node.vy + 32}
                    textAnchor="middle"
                    fontSize="11"
                    fill={isHovered || isSelected ? color : '#B0A49A'}
                    fontFamily="var(--font-mono)"
                    fontWeight={isHovered || isSelected ? '600' : '400'}
                    style={{ transition: 'fill 0.15s' }}
                  >
                    {node.label}
                  </text>
                  {/* Description on hover */}
                  {isHovered && (
                    <text
                      x={node.vx}
                      y={node.vy + 44}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#7A6D64"
                      fontFamily="var(--font-sans)"
                    >
                      {node.description}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Side panel when node selected */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.aside
              className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm sticky top-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              aria-label={`Details for ${selectedNodeData.label}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: NODE_TYPE_COLORS[selectedNodeData.type] }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-base font-semibold text-text-primary leading-tight">{selectedNodeData.label}</p>
                  <p className="text-xs text-text-tertiary">{NODE_TYPE_LABELS[selectedNodeData.type]}</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{selectedNodeData.description}</p>

              <div className="flex flex-col gap-2">
                <p className="text-2xs font-semibold uppercase tracking-widest text-text-disabled">Connected to</p>
                <div className="flex flex-wrap gap-2">
                  {ARCHITECTURE_EDGES.filter(
                    e => e.from === selectedNodeData.id || e.to === selectedNodeData.id
                  ).map((e, i) => {
                    const otherId = e.from === selectedNodeData.id ? e.to : e.from;
                    const other = positionedNodes.find(n => n.id === otherId);
                    if (!other) return null;
                    return (
                      <button
                        key={i}
                        className="text-xs font-medium bg-bg-elevated border border-border-subtle hover:border-border rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                        style={{ color: NODE_TYPE_COLORS[other.type] }}
                        onClick={() => setSelectedNode(otherId)}
                      >
                        {other.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {relatedQuestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-2xs font-semibold uppercase tracking-widest text-text-disabled">
                    Targeted interview questions
                  </p>
                  <div className="flex flex-col gap-2">
                    {relatedQuestions.map(q => (
                      <button
                        key={q.id}
                        className="w-full flex items-start gap-2 p-3 bg-bg-base/50 hover:bg-bg-elevated border border-border-subtle rounded-xl text-left text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        onClick={() => navigate(`/questions/${q.id}`)}
                      >
                        <Badge variant={q.difficulty === 'hard' ? 'error' : 'warning'} size="xs">
                          {q.difficulty}
                        </Badge>
                        <span className="truncate flex-1">{q.question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ArchitectureView;
