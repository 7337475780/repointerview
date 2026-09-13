import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileCode,
  Code2,
  Layers,
  Network,
  Database,
  Shield,
  Server,
  FileCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CodeBlock from '../../components/ui/CodeBlock';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const ProjectEvidence = () => {
  const { id } = useParams();
  const { projects, activeProject, getActiveIngestion } = useProject();
  const navigate = useNavigate();

  const [selectedPath, setSelectedPath] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  const project = (id ? projects.find(p => p.id === id) : null) || activeProject || projects[0] || null;
  const ingestion = getActiveIngestion(project?.id);
  const intelligence = project?.intelligence;

  // Build structured evidence items from intelligence and ingestion
  const evidenceItems = useMemo(() => {
    if (!project) return [];

    const itemMap = new Map();

    // 1. From Important Files
    if (intelligence?.importantFiles) {
      intelligence.importantFiles.forEach(file => {
        if (!itemMap.has(file.path)) {
          itemMap.set(file.path, {
            path: file.path,
            category: file.category || 'Architecture',
            explanation: file.explanation || 'Key architecture file',
            findings: [],
          });
        }
        const existing = itemMap.get(file.path);
        existing.explanation = file.explanation;
        existing.category = file.category || existing.category;
      });
    }

    // 2. From Technologies Evidence
    if (intelligence?.technologies) {
      intelligence.technologies.forEach(tech => {
        (tech.evidence || []).forEach(ev => {
          if (!ev.filePath) return;
          if (!itemMap.has(ev.filePath)) {
            itemMap.set(ev.filePath, {
              path: ev.filePath,
              category: 'Technology',
              explanation: `Evidence for ${tech.name}`,
              findings: [],
            });
          }
          itemMap.get(ev.filePath).findings.push({
            title: `${tech.name} (${tech.category})`,
            type: ev.evidenceType,
            description: ev.description,
            snippet: ev.snippet,
          });
        });
      });
    }

    // 3. From API Routes
    if (intelligence?.apiSurface?.routes) {
      intelligence.apiSurface.routes.forEach(route => {
        if (!route.filePath) return;
        if (!itemMap.has(route.filePath)) {
          itemMap.set(route.filePath, {
            path: route.filePath,
            category: 'API Surface',
            explanation: `API Route: ${route.method} ${route.path}`,
            findings: [],
          });
        }
        itemMap.get(route.filePath).findings.push({
          title: `Route: ${route.method} ${route.path}`,
          type: 'route_declaration',
          description: `Statically detected endpoint using ${route.framework}`,
          snippet: route.evidence?.snippet,
        });
      });
    }

    // 4. From Database Models
    if (intelligence?.database?.models) {
      intelligence.database.models.forEach(model => {
        if (!model.filePath) return;
        if (!itemMap.has(model.filePath)) {
          itemMap.set(model.filePath, {
            path: model.filePath,
            category: 'Database',
            explanation: `Database schema for ${model.name}`,
            findings: [],
          });
        }
        itemMap.get(model.filePath).findings.push({
          title: `Model: ${model.name}`,
          type: 'schema_definition',
          description: `Schema model with ${model.fields?.length || 0} fields and ${model.relationsCount || 0} relations`,
        });
      });
    }

    // 5. From Architecture Signals
    if (intelligence?.architectureSignals) {
      intelligence.architectureSignals.forEach(signal => {
        (signal.evidence || []).forEach(ev => {
          if (!ev.filePath) return;
          if (!itemMap.has(ev.filePath)) {
            itemMap.set(ev.filePath, {
              path: ev.filePath,
              category: 'Architecture',
              explanation: signal.description,
              findings: [],
            });
          }
          itemMap.get(ev.filePath).findings.push({
            title: signal.type,
            type: ev.evidenceType,
            description: ev.description,
            snippet: ev.snippet,
          });
        });
      });
    }

    // 6. From Ingested Source Files (if any files not yet in itemMap)
    if (ingestion?.sourceFiles) {
      ingestion.sourceFiles.forEach(file => {
        if (!itemMap.has(file.path)) {
          itemMap.set(file.path, {
            path: file.path,
            category: 'Source Code',
            explanation: `Ingested source file (${Math.round(file.size / 1024 * 10) / 10} KB)`,
            findings: [],
          });
        }
      });
    }

    return Array.from(itemMap.values());
  }, [project, intelligence, ingestion]);

  if (!project) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <EmptyState
          title="Project not found"
          description="The requested repository project does not exist in your workspace."
          actionLabel="View all projects"
          onAction={() => navigate('/projects')}
        />
      </div>
    );
  }

  if (evidenceItems.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        <ProjectNav projectId={project.id} />
        <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
          <EmptyState
            icon={<Code2 size={24} className="text-accent" />}
            title="Repository analysis is not available yet."
            description="Connect and analyze your repository to extract code evidence, schema definitions, and API routes."
            actionLabel="Connect Repository"
            onAction={() => navigate('/projects/new')}
            className="py-16 max-w-xl"
          />
        </div>
      </div>
    );
  }

  // Filter evidence items
  const categories = ['All', ...Array.from(new Set(evidenceItems.map(i => i.category)))];

  const filteredItems = evidenceItems.filter(item => {
    const matchCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchSearch =
      item.path.toLowerCase().includes(search.toLowerCase()) ||
      item.explanation.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const activeItem = filteredItems.find(i => i.path === selectedPath) || filteredItems[0] || evidenceItems[0];

  // Lookup source file content if available in ingestion result
  const activeSourceFile = ingestion?.sourceFiles?.find(f => f.path === activeItem?.path);

  return (
    <div className="flex flex-col min-h-full">
      <ProjectNav projectId={project.id} />

      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Traceability</p>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-1">Repository code evidence</h1>
            <p className="text-sm text-text-secondary mt-1">
              Traceable file paths, findings, AST tokens, and schema definitions discovered in <code className="text-accent font-mono text-xs">{project.repository.fullName}</code>
            </p>
          </div>
          <span className="text-xs font-mono text-text-tertiary bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-subtle self-start">
            {evidenceItems.length} Evidence Files Discovered
          </span>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* File Catalog Sidebar */}
          <div className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
            {/* Search and Category Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-bg-elevated border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary">
                <Search size={13} className="text-text-tertiary" />
                <input
                  type="search"
                  className="bg-transparent border-none outline-none text-xs flex-1 placeholder:text-text-disabled"
                  placeholder="Filter evidence files..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`text-2xs px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                      filterCategory === cat
                        ? 'bg-accent-subtle border-accent-border text-accent font-semibold'
                        : 'bg-bg-elevated border-border-subtle text-text-tertiary hover:text-text-primary'
                    }`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 max-h-[600px] overflow-y-auto pr-1">
              {filteredItems.map(item => {
                const isSelected = activeItem?.path === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent-subtle border border-accent-border text-accent font-semibold shadow-xs'
                        : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
                    }`}
                    onClick={() => setSelectedPath(item.path)}
                  >
                    <FileCode size={15} className={isSelected ? 'text-accent' : 'text-text-tertiary'} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs truncate">{item.path}</p>
                      <p className="text-2xs text-text-disabled truncate mt-0.5">{item.explanation}</p>
                    </div>
                    {item.findings.length > 0 && (
                      <span className="text-2xs font-mono bg-bg-elevated px-1.5 py-0.5 rounded text-accent">
                        {item.findings.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Inspector Details */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activeItem && (
              <>
                {/* Finding Summary Banner */}
                <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-bold text-text-primary">
                          {activeItem.path}
                        </span>
                        <Badge variant="neutral" size="xs">
                          {activeItem.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{activeItem.explanation}</p>
                    </div>
                  </div>

                  {/* Finding tags / signals */}
                  {activeItem.findings && activeItem.findings.length > 0 && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-border-subtle">
                      <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                        Discovered Findings ({activeItem.findings.length})
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {activeItem.findings.map((finding, idx) => (
                          <div
                            key={idx}
                            className="bg-bg-elevated border border-border-subtle rounded-lg p-3 flex flex-col gap-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-text-primary">{finding.title}</span>
                              <span className="font-mono text-2xs text-accent uppercase">{finding.type}</span>
                            </div>
                            <p className="text-2xs text-text-secondary">{finding.description}</p>
                            {finding.snippet && (
                              <pre className="font-mono text-2xs bg-bg-base p-2 rounded border border-border-subtle overflow-x-auto text-text-primary mt-1">
                                {finding.snippet}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Source Code Content */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                      Source Code Content
                    </p>
                    {activeSourceFile && (
                      <span className="font-mono text-2xs text-text-tertiary">
                        {Math.round(activeSourceFile.size / 1024 * 10) / 10} KB · {activeSourceFile.language}
                      </span>
                    )}
                  </div>

                  {activeSourceFile?.content ? (
                    <CodeBlock
                      code={activeSourceFile.content}
                      language={activeSourceFile.language}
                      filename={activeItem.path}
                      collapsible={false}
                      lineNumbers={true}
                    />
                  ) : (
                    <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 text-text-secondary text-xs">
                      <FileCode size={24} className="text-text-tertiary" />
                      <p className="font-mono text-text-primary">{activeItem.path}</p>
                      <p className="text-2xs text-text-disabled max-w-md">
                        This file path was identified as architectural evidence during repository analysis.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEvidence;
