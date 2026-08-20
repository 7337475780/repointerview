import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ARCHITECTURE_NODES, ARCHITECTURE_EDGES, QUESTIONS } from '../data/fixtures';
import Badge from '../components/ui/Badge';
import './ArchitectureView.css';

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

// Nodes already have absolute pixel coordinates within the 800x480 viewbox
const positionedNodes = ARCHITECTURE_NODES.map(n => ({
  ...n,
  vx: n.x,
  vy: n.y,
}));

const getNode = (id) => positionedNodes.find(n => n.id === id);

const ArchitectureView = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const navigate = useNavigate();

  const isEdgeHighlighted = (edge) => {
    if (!hoveredNode) return false;
    return edge.from === hoveredNode || edge.to === hoveredNode;
  };

  const isNodeConnected = (nodeId) => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    return ARCHITECTURE_EDGES.some(e =>
      (e.from === hoveredNode && e.to === nodeId) ||
      (e.to === hoveredNode && e.from === nodeId)
    );
  };

  const selectedNodeData = positionedNodes.find(n => n.id === selectedNode);
  const relatedQuestions = selectedNode
    ? QUESTIONS.filter(q => q.tags.some(t =>
        selectedNode.includes(t) || t.includes(selectedNode.replace('postgres', 'database'))
      )).slice(0, 3)
    : [];

  return (
    <div className="arch-view page">
      <div className="arch-view__header container">
        <div>
          <p className="section-label">Architecture</p>
          <h1 className="arch-view__title">Project architecture map</h1>
          <p className="arch-view__sub">Hover nodes to see relationships. Click to explore related questions.</p>
        </div>
        <div className="arch-legend">
          {Object.entries(NODE_TYPE_COLORS).map(([type, color]) => (
            <span key={type} className="arch-legend__item">
              <span className="arch-legend__dot" style={{ background: color }} aria-hidden="true" />
              {NODE_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
      </div>

      <div className="arch-view__body container">
        <div className="arch-canvas-wrapper">
          <svg
            className="arch-canvas"
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
                  x1={a.vx} y1={a.vy}
                  x2={b.vx} y2={b.vy}
                  stroke={color}
                  strokeWidth={highlighted ? 2 : 1}
                  strokeOpacity={highlighted ? 0.65 : hoveredNode ? 0.08 : 0.22}
                  strokeDasharray={highlighted ? undefined : '5 3'}
                  style={{ transition: 'stroke-opacity 0.2s, stroke-width 0.2s' }}
                />
              );
            })}

            {/* Nodes */}
            {positionedNodes.map((node, i) => {
              const color = NODE_TYPE_COLORS[node.type] || '#B0A49A';
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedNode === node.id;
              const connected = isNodeConnected(node.id);
              return (
                <g
                  key={node.id}
                  className={`arch-node arch-node--visible`}
                  style={{
                    cursor: 'pointer',
                    opacity: connected ? 1 : 0.18,
                    transition: 'opacity 0.2s',
                    '--delay': `${i * 0.07}s`,
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(s => s === node.id ? null : node.id)}
                  role="button"
                  aria-label={`${node.label}: ${node.description}`}
                  aria-pressed={isSelected}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setSelectedNode(s => s === node.id ? null : node.id)}
                >
                  {/* Outer glow ring (hover) */}
                  {(isHovered || isSelected) && (
                    <circle
                      cx={node.vx} cy={node.vy} r={30}
                      fill={color}
                      fillOpacity={0.08}
                    />
                  )}
                  {/* Selected ring */}
                  {isSelected && (
                    <circle cx={node.vx} cy={node.vy} r={22}
                      fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.5} />
                  )}
                  {/* Main circle */}
                  <circle
                    cx={node.vx} cy={node.vy} r={18}
                    fill={`${color}1A`}
                    stroke={color}
                    strokeWidth={isHovered || isSelected ? 2 : 1.2}
                    strokeOpacity={isHovered || isSelected ? 1 : 0.6}
                  />
                  {/* Center dot */}
                  <circle cx={node.vx} cy={node.vy} r={5} fill={color} fillOpacity={0.9} />

                  {/* Label */}
                  <text
                    x={node.vx} y={node.vy + 32}
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
                  {(isHovered) && (
                    <text
                      x={node.vx} y={node.vy + 44}
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
        {selectedNodeData && (
          <motion.aside
            className="arch-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            aria-label={`Details for ${selectedNodeData.label}`}
          >
            <div className="arch-panel__header">
              <div className="arch-panel__dot" style={{ background: NODE_TYPE_COLORS[selectedNodeData.type] }} aria-hidden="true" />
              <div>
                <p className="arch-panel__name">{selectedNodeData.label}</p>
                <p className="arch-panel__type">{NODE_TYPE_LABELS[selectedNodeData.type]}</p>
              </div>
            </div>
            <p className="arch-panel__desc">{selectedNodeData.description}</p>

            <div className="arch-panel__connections">
              <p className="arch-panel__section-label">Connected to</p>
              <div className="arch-panel__connection-list">
                {ARCHITECTURE_EDGES
                  .filter(e => e.from === selectedNodeData.id || e.to === selectedNodeData.id)
                  .map((e, i) => {
                    const otherId = e.from === selectedNodeData.id ? e.to : e.from;
                    const other = positionedNodes.find(n => n.id === otherId);
                    if (!other) return null;
                    return (
                      <span
                        key={i}
                        className="arch-panel__conn-item"
                        style={{ '--conn-color': NODE_TYPE_COLORS[other.type] }}
                        onClick={() => setSelectedNode(otherId)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={ev => ev.key === 'Enter' && setSelectedNode(otherId)}
                      >
                        {other.label}
                      </span>
                    );
                  })}
              </div>
            </div>

            {relatedQuestions.length > 0 && (
              <div className="arch-panel__questions">
                <p className="arch-panel__section-label">Related questions</p>
                {relatedQuestions.map(q => (
                  <button
                    key={q.id}
                    className="arch-panel__question"
                    onClick={() => navigate(`/questions/${q.id}`)}
                  >
                    <Badge variant={q.difficulty === 'hard' ? 'error' : 'warning'} size="xs">{q.difficulty}</Badge>
                    <span>{q.question.slice(0, 65)}…</span>
                  </button>
                ))}
              </div>
            )}
          </motion.aside>
        )}
      </div>
    </div>
  );
};

export default ArchitectureView;
