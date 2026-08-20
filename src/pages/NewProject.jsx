import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import IngestionProgress from '../components/ingestion/IngestionProgress';
import IngestionSuccess from '../components/ingestion/IngestionSuccess';
import IngestionError from '../components/ingestion/IngestionError';
import { useProject } from '../context/ProjectContext';
import { repositoryService } from '../services/repositoryService';

const NewProject = () => {
  const navigate = useNavigate();
  const { addProjectFromIngestion } = useProject();

  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [progressEvent, setProgressEvent] = useState(null);
  const [ingestionResult, setIngestionResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError('');
    setApiError(null);
    setIngestionResult(null);

    const parsed = repositoryService.validateUrl(url);
    if (!parsed.valid) {
      setValidationError(parsed.error || 'Please provide a valid GitHub repository URL.');
      return;
    }

    setIngesting(true);

    try {
      const result = await repositoryService.ingestRepository(url, (event) => {
        setProgressEvent(event);
      });

      const newProject = addProjectFromIngestion(result);
      setIngestionResult({ result, project: newProject });
    } catch (err) {
      setApiError(err?.message || 'Failed to connect to the GitHub repository.');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer self-start"
      >
        <ArrowLeft size={14} />
        <span>Back to projects</span>
      </button>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">New Project</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Connect repository</h1>
        <p className="text-sm text-text-secondary mt-1">
          RepoInterview AI will inspect your public repository structure and source files to prepare interview intelligence.
        </p>
      </div>

      {/* Main Flow Area */}
      <div className="flex flex-col gap-6">
        {!ingestionResult ? (
          <div className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Input
                id="repo-url"
                label="GitHub Repository URL"
                placeholder="https://github.com/expressjs/express"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (validationError) setValidationError('');
                  if (apiError) setApiError(null);
                }}
                error={validationError}
                leftIcon={<GitBranch size={16} />}
                hint="Supports public GitHub repositories. Unauthenticated REST API integration."
                disabled={ingesting}
                autoFocus
              />

              <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                <span className="font-semibold text-text-secondary">Try popular repositories:</span>
                {[
                  'https://github.com/expressjs/express',
                  'https://github.com/facebook/relay',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    className="font-mono text-accent hover:underline cursor-pointer bg-bg-elevated px-2 py-0.5 rounded border border-border-subtle"
                    onClick={() => {
                      setUrl(sample);
                      setValidationError('');
                      setApiError(null);
                    }}
                    disabled={ingesting}
                  >
                    {sample.replace('https://github.com/', '')}
                  </button>
                ))}
              </div>

              {/* Progress UI */}
              <AnimatePresence>
                {ingesting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <IngestionProgress progressEvent={progressEvent} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error UI */}
              {apiError && (
                <IngestionError
                  error={apiError}
                  onRetry={() => handleSubmit()}
                />
              )}

              <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
                <p className="text-2xs text-text-tertiary flex items-center gap-1">
                  <Sparkles size={12} className="text-accent" />
                  <span>Single-call recursive Git tree & score-based file selection</span>
                </p>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={ingesting}
                  rightIcon={<ArrowRight size={14} />}
                >
                  {ingesting ? 'Ingesting...' : 'Ingest repository'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Ingestion Complete Success Screen */
          <IngestionSuccess
            result={ingestionResult.result}
            onOpenWorkspace={() => navigate(`/projects/${ingestionResult.project.id}`)}
          />
        )}
      </div>
    </div>
  );
};

export default NewProject;
