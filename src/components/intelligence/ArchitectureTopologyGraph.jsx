import { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Filter,
  ArrowRight,
  FileCode,
  CheckCircle2,
  Share2,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import ArchitectureCustomNode from './ArchitectureCustomNode';
import ArchitectureCustomEdge from './ArchitectureCustomEdge';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const nodeTypes = {
  architectureNode: ArchitectureCustomNode,
};

const edgeTypes = {
  architectureEdge: ArchitectureCustomEdge,
};

// Layer hierarchy for clean DAG positioning
const ROLE_LAYERS = {
  frontend: 0,
  server: 1,
  router: 2,
  controller: 2,
  middleware: 2,
  service: 3,
  shared_library: 3,
  database: 4,
  cache: 4,
  auth: 4,
  external: 5,
  deployment: 5,
  test: 5,
  storage: 4,
};

const ArchitectureTopologyGraph = ({ architectureMap }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeData, setSelectedEdgeData] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [rfInstance, setRfInstance] = useState(null);

  const rawNodes = architectureMap?.nodes || [];
  const rawEdges = architectureMap?.edges || [];

  // Extract existing categories for filter pills
  const availableCategories = useMemo(() => {
    const cats = new Set(rawNodes.map(n => n.type));
    return ['ALL', ...Array.from(cats)];
  }, [rawNodes]);

  // Compute hierarchical layout coordinates
  const { initialNodes, initialEdges } = useMemo(() => {
    const layerBuckets = new Map();

    rawNodes.forEach(node => {
      const layer = ROLE_LAYERS[node.type] !== undefined ? ROLE_LAYERS[node.type] : 2;
      if (!layerBuckets.has(layer)) {
        layerBuckets.set(layer, []);
      }
      layerBuckets.get(layer).push(node);
    });

    const calculatedNodes = [];
    const sortedLayers = Array.from(layerBuckets.keys()).sort((a, b) => a - b);

    sortedLayers.forEach((layerIdx, colIdx) => {
      const nodesInLayer = layerBuckets.get(layerIdx);
      const totalInLayer = nodesInLayer.length;
      const layerHeight = totalInLayer * 170;
      const startY = Math.max(40, 260 - layerHeight / 2);

      nodesInLayer.forEach((node, rowIdx) => {
        calculatedNodes.push({
          id: node.id,
          type: 'architectureNode',
          position: {
            x: 60 + colIdx * 320,
            y: startY + rowIdx * 170,
          },
          data: {
            ...node,
            label: node.label,
            type: node.type,
            description: node.description,
            evidenceFiles: node.evidenceFiles || [],
            confidence: node.confidence || 0.95,
          },
        });
      });
    });

    const calculatedEdges = rawEdges.map(edge => {
      const edgeId = edge.id || `${edge.from}-${edge.to}`;
      return {
        id: edgeId,
        source: edge.from || edge.source,
        target: edge.to || edge.target,
        type: 'architectureEdge',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: '#D4714A',
        },
        data: {
          ...edge,
          relationship: edge.relationship || 'IMPORTS',
          confidence: edge.confidence || 0.95,
          confidenceLevel: edge.confidenceLevel || 'high',
          description: edge.description,
          evidenceFiles: edge.evidenceFiles || [],
          onSelectEdge: (eData) => {
            setSelectedEdgeData(eData);
            setSelectedNodeId(null);
          },
        },
      };
    });

    return { initialNodes: calculatedNodes, initialEdges: calculatedEdges };
  }, [rawNodes, rawEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when props change
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle category filtering and hover dimming
  const filteredNodes = useMemo(() => {
    const activeTarget = hoveredNodeId || selectedNodeId;
    const connectedNodeIds = new Set();

    if (activeTarget) {
      connectedNodeIds.add(activeTarget);
      rawEdges.forEach(e => {
        if (e.from === activeTarget) connectedNodeIds.add(e.to);
        if (e.to === activeTarget) connectedNodeIds.add(e.from);
      });
    }

    return nodes.map(node => {
      const matchCategory = activeCategory === 'ALL' || node.data.type === activeCategory;
      const isDimmed = activeTarget ? !connectedNodeIds.has(node.id) : false;
      const isHighlighted = activeTarget === node.id;

      return {
        ...node,
        hidden: !matchCategory,
        data: {
          ...node.data,
          isDimmed,
          isHighlighted,
        },
      };
    });
  }, [nodes, activeCategory, hoveredNodeId, selectedNodeId, rawEdges]);

  const filteredEdges = useMemo(() => {
    const activeTarget = hoveredNodeId || selectedNodeId;

    return edges.map(edge => {
      const isConnected = activeTarget ? edge.source === activeTarget || edge.target === activeTarget : false;
      const isDimmed = activeTarget ? !isConnected : false;
      const isSelected = selectedEdgeData && selectedEdgeData.from === edge.source && selectedEdgeData.to === edge.target;

      return {
        ...edge,
        data: {
          ...edge.data,
          isDimmed,
          isHighlighted: isConnected || isSelected,
        },
      };
    });
  }, [edges, hoveredNodeId, selectedNodeId, selectedEdgeData]);

  // Selected node details
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return rawNodes[0] || null;
    return rawNodes.find(n => n.id === selectedNodeId) || rawNodes[0] || null;
  }, [selectedNodeId, rawNodes]);

  const outgoingFlows = useMemo(() => {
    if (!selectedNode) return [];
    return rawEdges.filter(e => e.from === selectedNode.id || e.source === selectedNode.id);
  }, [selectedNode, rawEdges]);

  const incomingFlows = useMemo(() => {
    if (!selectedNode) return [];
    return rawEdges.filter(e => e.to === selectedNode.id || e.target === selectedNode.id);
  }, [selectedNode, rawEdges]);

  // Canvas Control Callbacks
  const handleFitView = useCallback(() => {
    if (rfInstance) {
      rfInstance.fitView({ padding: 0.2, duration: 400 });
    }
  }, [rfInstance]);

  const handleZoomIn = useCallback(() => {
    if (rfInstance) {
      rfInstance.zoomIn({ duration: 300 });
    }
  }, [rfInstance]);

  const handleZoomOut = useCallback(() => {
    if (rfInstance) {
      rfInstance.zoomOut({ duration: 300 });
    }
  }, [rfInstance]);

  const handleResetZoom = useCallback(() => {
    if (rfInstance) {
      rfInstance.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 300 });
    }
  }, [rfInstance]);

  const handleNodeClick = useCallback((_, node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeData(null);
  }, []);

  const handleEdgeClick = useCallback((_, edge) => {
    setSelectedEdgeData(edge.data);
    setSelectedNodeId(null);
  }, []);

  const handleNodeMouseEnter = useCallback((_, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  if (rawNodes.length === 0) {
    return (
      <div className="bg-bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-tertiary">
          <Layers size={22} />
        </div>
        <h3 className="text-base font-bold text-text-primary">
          Repository analyzed, but no architectural components could be confidently inferred.
        </h3>
        <p className="text-xs text-text-secondary max-w-md leading-relaxed">
          No distinct structural boundaries were identified in candidate files. Inspect the Evidence Catalog or Overview for raw metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Interactive Graph Canvas & Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Canvas Area */}
        <div className="lg:col-span-8 bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[640px] relative">
          {/* Top Canvas Bar */}
          <div className="bg-bg-surface/90 backdrop-blur-md border-b border-border-subtle p-3 px-4 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">
                System Topology Canvas
              </span>
              <span className="text-2xs font-mono text-text-tertiary bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle">
                {rawNodes.length} Components · {rawEdges.length} Verified Flow{rawEdges.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`text-3xs font-mono font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer border ${
                    activeCategory === cat
                      ? 'bg-accent text-white border-accent shadow-xs'
                      : 'bg-bg-elevated/70 border-border-subtle text-text-tertiary hover:text-text-primary hover:bg-bg-elevated'
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Zoom / Viewport Toolbar */}
            <div className="flex items-center gap-1 bg-bg-elevated border border-border-subtle rounded-lg p-0.5">
              <button
                type="button"
                className="p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-surface rounded transition-colors cursor-pointer"
                title="Fit to screen"
                onClick={handleFitView}
              >
                <Maximize2 size={13} />
              </button>
              <button
                type="button"
                className="p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-surface rounded transition-colors cursor-pointer"
                title="Zoom in"
                onClick={handleZoomIn}
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                className="p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-surface rounded transition-colors cursor-pointer"
                title="Zoom out"
                onClick={handleZoomOut}
              >
                <ZoomOut size={13} />
              </button>
              <button
                type="button"
                className="p-1 text-text-tertiary hover:text-text-primary hover:bg-bg-surface rounded transition-colors cursor-pointer"
                title="Reset View"
                onClick={handleResetZoom}
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* React Flow Viewport */}
          <div className="flex-1 w-full h-full relative bg-bg-base">
            <ReactFlow
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={(instance) => {
                setRfInstance(instance);
                setTimeout(() => instance.fitView({ padding: 0.2 }), 100);
              }}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
              fitView
              minZoom={0.2}
              maxZoom={1.8}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                color="var(--color-border)"
                gap={24}
                size={1.5}
              />
              <MiniMap
                nodeColor={(n) => {
                  if (n.data?.type === 'server') return '#D4714A';
                  if (n.data?.type === 'database') return '#10B981';
                  if (n.data?.type === 'router') return '#F97316';
                  if (n.data?.type === 'auth') return '#F43F5E';
                  return '#6B7280';
                }}
                maskColor="rgba(26, 23, 20, 0.75)"
                className="!bg-bg-surface !border !border-border !rounded-xl !shadow-md !m-4"
                style={{ width: 120, height: 80 }}
              />
            </ReactFlow>

            {/* Empty flows banner overlay if no edges found */}
            {rawEdges.length === 0 && (
              <div className="absolute bottom-4 left-4 right-4 bg-bg-surface/90 border border-border-subtle backdrop-blur-md p-3 rounded-xl flex items-center gap-2 text-2xs text-text-secondary z-10">
                <Info size={14} className="text-accent flex-shrink-0" />
                <span>
                  Components detected, but no verified inter-component import relationships were found in analyzed source files.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Inspector (Node or Edge) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {selectedEdgeData ? (
            /* Edge Relationship Inspector */
            <div className="bg-bg-surface border border-accent rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-2xs font-semibold uppercase tracking-widest text-accent">
                  Verified Data Flow
                </span>
                <Badge variant="accent" size="xs">
                  {selectedEdgeData.relationship || 'IMPORTS'}
                </Badge>
              </div>

              <div>
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-text-primary">
                  <span>{selectedEdgeData.from || selectedEdgeData.source}</span>
                  <ArrowRight size={14} className="text-accent" />
                  <span>{selectedEdgeData.to || selectedEdgeData.target}</span>
                </div>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  {selectedEdgeData.description || `${selectedEdgeData.from} ${selectedEdgeData.relationship} ${selectedEdgeData.to}`}
                </p>
              </div>

              <div className="bg-bg-elevated p-3.5 rounded-xl border border-border-subtle flex items-center justify-between text-xs">
                <span className="text-text-tertiary">Verification Confidence:</span>
                <span className="font-mono font-bold text-accent">
                  {Math.round((selectedEdgeData.confidence || 0.95) * 100)}% ({selectedEdgeData.confidenceLevel || 'high'})
                </span>
              </div>

              {selectedEdgeData.evidenceFiles && selectedEdgeData.evidenceFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Evidence Trail Files ({selectedEdgeData.evidenceFiles.length})
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
                    {selectedEdgeData.evidenceFiles.map(file => (
                      <div
                        key={file}
                        className="flex items-center gap-2 text-2xs font-mono text-text-primary bg-bg-elevated p-2 rounded-lg border border-border-subtle"
                      >
                        <FileCode size={12} className="text-accent flex-shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : selectedNode ? (
            /* Component Node Inspector */
            <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                  Component Inspector
                </span>
                <Badge variant="success" size="xs">
                  {selectedNode.type?.toUpperCase() || 'VERIFIED'}
                </Badge>
              </div>

              <div>
                <h4 className="text-base font-bold text-text-primary font-mono">
                  {selectedNode.label}
                </h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Confidence & Evidence stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-bg-elevated p-2.5 rounded-xl border border-border-subtle flex flex-col gap-0.5">
                  <span className="text-3xs text-text-tertiary uppercase">Confidence</span>
                  <span className="font-mono font-bold text-accent">
                    {Math.round((selectedNode.confidence || 0.95) * 100)}%
                  </span>
                </div>
                <div className="bg-bg-elevated p-2.5 rounded-xl border border-border-subtle flex flex-col gap-0.5">
                  <span className="text-3xs text-text-tertiary uppercase">Evidence Files</span>
                  <span className="font-mono font-bold text-text-primary">
                    {selectedNode.evidenceFiles?.length || 1}
                  </span>
                </div>
              </div>

              {/* Connected Flows */}
              {(outgoingFlows.length > 0 || incomingFlows.length > 0) && (
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Connected Flows ({outgoingFlows.length + incomingFlows.length})
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                    {outgoingFlows.map((e, idx) => (
                      <button
                        key={`out-${idx}`}
                        type="button"
                        className="text-2xs font-mono p-2 rounded-lg bg-bg-elevated hover:bg-bg-overlay border border-border-subtle flex items-center justify-between text-left transition-colors cursor-pointer"
                        onClick={() => setSelectedEdgeData(e)}
                      >
                        <span className="text-text-secondary">↳ Out to <strong className="text-text-primary">{e.to}</strong></span>
                        <span className="text-accent font-semibold">{e.relationship || 'USES'}</span>
                      </button>
                    ))}
                    {incomingFlows.map((e, idx) => (
                      <button
                        key={`in-${idx}`}
                        type="button"
                        className="text-2xs font-mono p-2 rounded-lg bg-bg-elevated hover:bg-bg-overlay border border-border-subtle flex items-center justify-between text-left transition-colors cursor-pointer"
                        onClick={() => setSelectedEdgeData(e)}
                      >
                        <span className="text-text-secondary">↲ In from <strong className="text-text-primary">{e.from}</strong></span>
                        <span className="text-accent font-semibold">{e.relationship || 'USES'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Evidence Files */}
              {selectedNode.evidenceFiles && selectedNode.evidenceFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Source Evidence Files
                  </span>
                  <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                    {selectedNode.evidenceFiles.map(file => (
                      <div
                        key={file}
                        className="flex items-center gap-2 text-2xs font-mono text-text-primary bg-bg-elevated p-2 rounded-lg border border-border-subtle"
                      >
                        <FileCode size={12} className="text-accent flex-shrink-0" />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Secondary Component Summary Ribbon */}
      <div className="bg-bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
            Verified Component Registry
          </span>
          <span className="text-2xs text-text-disabled">Click any component to focus on canvas</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {rawNodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            return (
              <button
                key={node.id}
                type="button"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-accent text-white border-accent shadow-xs'
                    : 'bg-bg-elevated text-text-secondary border-border-subtle hover:text-text-primary hover:border-border'
                }`}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  setSelectedEdgeData(null);
                  if (rfInstance) {
                    const targetNode = nodes.find(n => n.id === node.id);
                    if (targetNode) {
                      rfInstance.setCenter(targetNode.position.x + 100, targetNode.position.y + 50, { zoom: 1.1, duration: 400 });
                    }
                  }
                }}
              >
                <span>{node.label}</span>
                <span className={`text-3xs px-1.5 py-0.2 rounded uppercase ${isSelected ? 'bg-black/20 text-white' : 'bg-bg-surface text-text-tertiary'}`}>
                  {node.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ArchitectureTopologyGraph;
