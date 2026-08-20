import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileCode, Code2, ArrowRight } from 'lucide-react';
import ProjectNav from '../../components/layout/ProjectNav';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CodeBlock from '../../components/ui/CodeBlock';
import EmptyState from '../../components/ui/EmptyState';
import { useProject } from '../../context/ProjectContext';

const ProjectEvidence = () => {
  const { id } = useParams();
  const { projects } = useProject();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === id);

  const evidenceFiles = (project?.questions || [])
    .filter(q => q.evidence)
    .map(q => ({
      path: q.evidence.filename,
      category: q.category,
      language: q.evidence.language,
      question: q,
    }));

  const [selectedFile, setSelectedFile] = useState(evidenceFiles[0] || null);

  if (!project || evidenceFiles.length === 0) {
    return (
      <div className="flex flex-col min-h-full">
        {project && <ProjectNav projectId={project.id} />}
        <div className="p-12 max-w-2xl mx-auto flex flex-col items-center justify-center flex-1">
          <EmptyState
            icon={<Code2 size={24} className="text-accent" />}
            title="Source code evidence will be extracted from your repository after analysis."
            description="Actual project evidence will be linked to specific files, AST tokens, and schema definitions during repository ingestion."
            actionLabel="Connect Repository"
            onAction={() => navigate('/projects/new')}
            className="py-16 max-w-xl"
          />
        </div>
      </div>
    );
  }

  const activeFile = selectedFile || evidenceFiles[0];

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
              Inspect the exact files, schemas, and API routes that generate interview questions.
            </p>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* File Catalog Sidebar */}
          <div className="lg:col-span-4 bg-bg-surface border border-border rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <p className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary px-3 py-1">
              Evidence Files
            </p>
            <div className="flex flex-col gap-1">
              {evidenceFiles.map(file => {
                const isSelected = activeFile?.path === file.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent-subtle border border-accent-border text-accent font-semibold shadow-xs'
                        : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <FileCode size={16} className={isSelected ? 'text-accent' : 'text-text-tertiary'} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs truncate">{file.path}</p>
                      <p className="text-2xs text-text-disabled mt-0.5">{file.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Inspector */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {activeFile && (
              <>
                {/* Associated Question Banner */}
                <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
                      Generated Interview Question
                    </span>
                    <Badge variant={activeFile.question.difficulty === 'hard' ? 'error' : 'warning'} size="xs">
                      {activeFile.question.difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-text-primary">{activeFile.question.question}</h3>
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="text-xs text-text-tertiary font-mono">
                      {activeFile.question.probability}% probability
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={<ArrowRight size={13} />}
                      onClick={() => navigate(`/projects/${project.id}/questions/${activeFile.question.id}`)}
                    >
                      View full defense
                    </Button>
                  </div>
                </div>

                {/* Source Code Viewer */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                    Source Code Context
                  </p>
                  <CodeBlock
                    code={activeFile.question.evidence.code}
                    language={activeFile.language}
                    filename={activeFile.path}
                    highlightLines={activeFile.question.evidence.highlightLines}
                    collapsible={false}
                    lineNumbers={true}
                  />
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
