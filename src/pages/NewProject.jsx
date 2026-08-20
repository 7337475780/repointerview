import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useProject } from '../context/ProjectContext';

const GITHUB_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/?$/;

const PRE_FLIGHT_STEPS = [
  'Validating repository accessibility & permissions',
  'Inspecting repository AST and tree structure',
  'Detecting build frameworks, ORMs, and dependency graphs',
  'Initializing Project Knowledge Graph',
];

const NewProject = () => {
  const navigate = useNavigate();
  const { addProject } = useProject();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  const validateUrl = (val) => {
    if (!val.trim()) {
      setError('GitHub repository URL is required.');
      return false;
    }
    if (!GITHUB_REGEX.test(val.trim())) {
      setError('Please provide a valid GitHub URL, e.g. https://github.com/owner/repository');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateUrl(url)) return;

    setSubmitting(true);
    // Simulate initial pre-flight checklist step progression
    PRE_FLIGHT_STEPS.forEach((_, i) => {
      setTimeout(() => setStepIdx(i), i * 600);
    });

    setTimeout(() => {
      const newProj = addProject(url);
      navigate(`/projects/${newProj.id}`);
    }, PRE_FLIGHT_STEPS.length * 600 + 400);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col gap-8">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-colors cursor-pointer self-start"
      >
        <ArrowLeft size={14} />
        <span>Back</span>
      </button>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">New Project</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Connect repository</h1>
        <p className="text-sm text-text-secondary mt-1">
          RepoInterview AI will inspect your repository to predict technical interview questions.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-bg-surface border border-border rounded-2xl p-8 flex flex-col gap-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            id="repo-url"
            label="GitHub Repository URL"
            placeholder="https://github.com/alexchen/notionify"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) validateUrl(e.target.value);
            }}
            error={error}
            leftIcon={<GitBranch size={16} />}
            hint="Supports public repositories. Private repository access will be supported via GitHub App."
            disabled={submitting}
            autoFocus
          />

          <div className="flex flex-wrap gap-2 text-xs text-text-tertiary">
            <span className="font-semibold text-text-secondary">Try example:</span>
            <button
              type="button"
              className="font-mono text-accent hover:underline cursor-pointer"
              onClick={() => {
                setUrl('https://github.com/alexchen/notionify');
                setError('');
              }}
              disabled={submitting}
            >
              https://github.com/alexchen/notionify
            </button>
          </div>

          <AnimatePresence>
            {submitting && (
              <motion.div
                className="bg-bg-elevated border border-border-subtle rounded-xl p-5 flex flex-col gap-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting repository pipeline...</span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  {PRE_FLIGHT_STEPS.map((step, idx) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2.5 text-xs font-mono transition-opacity ${
                        idx < stepIdx
                          ? 'text-success'
                          : idx === stepIdx
                          ? 'text-accent font-medium'
                          : 'text-text-disabled opacity-40'
                      }`}
                    >
                      {idx < stepIdx ? (
                        <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                      ) : idx === stepIdx ? (
                        <span className="w-2 h-2 rounded-full bg-accent animate-ping flex-shrink-0 ml-1 mr-0.5" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border border-border-subtle flex-shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
            <p className="text-2xs text-text-tertiary flex items-center gap-1">
              <Sparkles size={12} className="text-accent" />
              <span>Analysis engine ready for Phase 2 integration</span>
            </p>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              rightIcon={<ArrowRight size={14} />}
            >
              Analyze repository
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProject;
