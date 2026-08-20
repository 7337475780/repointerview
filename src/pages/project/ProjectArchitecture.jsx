import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';
import { QUESTIONS } from '../../data/fixtures';

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

const ProjectArchitecture = () => {
  const { id } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const project = projects.find(p => p.id === id) || projects[0];

  if (!project || !project.architecture || project.architecture.nodes.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        <ProjectNav projectId={id || 'notionify'} />
        <div className="p-12 max-w-2xl mx-auto">
          <EmptyState
            title="Architecture map pending"
            description="The architecture topology graph will be generated when repository AST and services are mapped in Phase 2."
            actionLabel="View questions"
            onAction={() => navigate(`/projects/${id || 'notionify'}/questions`)}
          />
        </div>
      </div>
    );
  }

  const { nodes, edges } = project.architecture;
  const positionedNodes = nodes.map(n => ({ ...n, vx: n.x, vy: n.y }));
  const getNode = nodeId => positionedNodes.find(n => n.id === nodeId);

  const isEdgeHighlighted = edge => {
    if (!hoveredNode) return false;
    return edge.from === hoveredNode || edge.to === hoveredNode;
  };

  const isNodeConnected = nodeId => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    return edges.some(
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
    <div className="flex flex-col min-h-full">
      <ProjectNav projectId={project.id} />

      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">System Design</p>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Project architecture map</h1>
            <p className="text-sm text-text-secondary mt-1">
              Topological relationship model inferred from codebase dependencies and imports.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-bg-surface border border-border rounded-xl px-4 py-2 shadow-xs">
            {Object.entries(NODE_TYPE_COLORS).map(([type, color]) => (
              <span key={type} className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
                {NODE_TYPE_LABELS[type]}
              </span>
            ))}
          </div>
        </div>

        {/* Canvas and Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm relative h-[500px] transition-all duration-300 ${
              selectedNodeData ? 'lg:col-span-8' : 'lg:col-span-12'
            }`}
          >
            <svg
              className="w-full h-full block"
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              width="100%"
              height="100%"
              aria-label="Architecture topology diagram"
              role="img"
            >
              {/* Edges */}
              {edges.map((edge, i) => {
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
                    {(isHovered || isSelected) && (
                      <circle cx={node.vx} cy={node.vy} r={30} fill={color} fillOpacity={0.08} />
                    )}
                    {isSelected && (
                      <circle cx={node.vx} cy={node.vy} r={22} fill="none" stroke={color} strokeWidth={1.5} strokeOpacity={0.5} />
                    )}
                    <circle
                      cx={node.vx}
                      cy={node.vy}
                      r={18}
                      fill={`${color}1A`}
                      stroke={color}
                      strokeWidth={isHovered || isSelected ? 2 : 1.2}
                      strokeOpacity={isHovered || isSelected ? 1 : 0.6}
                    />
                    <circle cx={node.vx} cy={node.vy} r={5} fill={color} fillOpacity={0.9} />
                    <text
                      x={node.vx}
                      y={node.vy + 32}
                      textAnchor="middle"
                      fontSize="11"
                      fill={isHovered || isSelected ? color : '#B0A49A'}
                      fontFamily="var(--font-mono)"
                      fontWeight={isHovered || isSelected ? '600' : '400'}
                    >
                      {node.label}
                    </text>
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

          {/* Details Drawer */}
          <AnimatePresence>
            {selectedNodeData && (
              <motion.aside
                className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ background: NODE_TYPE_COLORS[selectedNodeData.type] }}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-text-primary leading-tight">{selectedNodeData.label}</h3>
                    <p className="text-xs text-text-tertiary">{NODE_TYPE_LABELS[selectedNodeData.type]}</p>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{selectedNodeData.description}</p>

                {relatedQuestions.length > 0 && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-text-disabled">
                      Related interview questions
                    </p>
                    <div className="flex flex-col gap-2">
                      {relatedQuestions.map(q => (
                        <button
                          key={q.id}
                          className="w-full flex items-start gap-2 p-3 bg-bg-elevated/60 hover:bg-bg-elevated border border-border-subtle rounded-xl text-left text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          onClick={() => navigate(`/projects/${project.id}/questions/${q.id}`)}
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
    </div>
  );
};

export default ProjectArchitecture;
