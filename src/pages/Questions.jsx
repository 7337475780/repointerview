import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { QUESTIONS } from '../data/fixtures';

const CATEGORIES = ['All', ...new Set(QUESTIONS.map(q => q.category))];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

const Questions = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('all');

  const filtered = QUESTIONS.filter(q => {
    const matchSearch =
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || q.category === category;
    const matchDiff = difficulty === 'all' || q.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="py-8 border-b border-border-subtle">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Questions Bank</p>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Interview questions</h1>
          <p className="text-sm text-text-tertiary mt-2">
            {QUESTIONS.length} predicted questions generated from{' '}
            <code className="text-xs text-accent font-mono bg-bg-elevated px-1.5 py-0.5 rounded border border-border-subtle">
              alexchen/notionify
            </code>
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 py-6">
          <div className="flex items-center gap-3 bg-bg-elevated border border-border focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 rounded-xl px-4 py-2 max-w-lg transition-all shadow-xs">
            <Search size={15} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
            <input
              id="qs-search-input"
              type="search"
              className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-disabled"
              placeholder="Search questions by topic, keyword, or architecture component..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search questions"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`text-xs font-medium rounded-full px-3 py-1 transition-all cursor-pointer border ${
                  category === cat
                    ? 'bg-accent/15 border-accent/30 text-accent font-semibold shadow-xs'
                    : 'bg-bg-elevated border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border'
                }`}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by difficulty">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`text-xs font-medium rounded-full px-3 py-1 transition-all cursor-pointer border ${
                  difficulty === d
                    ? 'bg-accent/15 border-accent/30 text-accent font-semibold shadow-xs'
                    : 'bg-bg-elevated border-border-subtle text-text-tertiary hover:text-text-primary hover:border-border'
                }`}
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
              >
                {d === 'all' ? 'All levels' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="font-mono text-xs text-text-disabled mb-4">
          Showing {filtered.length} question{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Question list */}
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-start gap-3">
            <p className="text-base text-text-tertiary">No questions match your current filters.</p>
            <button
              className="text-sm text-accent hover:underline font-medium cursor-pointer"
              onClick={() => {
                setSearch('');
                setCategory('All');
                setDifficulty('all');
              }}
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border-subtle border-t border-border-subtle">
            {filtered.map((q, i) => (
              <motion.button
                key={q.id}
                className="w-full flex items-center justify-between gap-6 py-5 px-3 -mx-3 rounded-xl text-left cursor-pointer transition-all duration-150 hover:bg-bg-elevated/70 group"
                onClick={() => navigate(`/questions/${q.id}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                aria-label={`${q.question} — ${q.difficulty}, ${q.probability}% probability`}
              >
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'}
                      size="xs"
                    >
                      {q.difficulty}
                    </Badge>
                    <Badge variant="neutral" size="xs">
                      {q.category}
                    </Badge>
                  </div>
                  <p className="text-base font-medium text-text-primary leading-snug group-hover:text-accent transition-colors">
                    {q.question}
                  </p>
                  <p className="font-mono text-xs text-text-disabled">↳ {q.evidence.filename}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold font-mono text-text-primary">{q.probability}%</span>
                    <span className="text-2xs text-text-disabled uppercase">probability</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-text-disabled group-hover:text-accent group-hover:translate-x-1 transition-all"
                    aria-hidden="true"
                  />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
