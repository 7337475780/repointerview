import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { QUESTIONS } from '../data/fixtures';
import './Questions.css';

const CATEGORIES = ['All', ...new Set(QUESTIONS.map(q => q.category))];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

const Questions = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('all');

  const filtered = QUESTIONS.filter(q => {
    const matchSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || q.category === category;
    const matchDiff = difficulty === 'all' || q.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div className="questions-page page">
      <div className="container">
        <div className="qs-header">
          <div>
            <p className="section-label">Questions</p>
            <h1 className="qs-title">Interview questions</h1>
            <p className="qs-sub">{QUESTIONS.length} questions generated from <code>alexchen/notionify</code></p>
          </div>
        </div>

        {/* Filters */}
        <div className="qs-filters">
          <div className="qs-search">
            <Search size={14} className="qs-search__icon" aria-hidden="true" />
            <input
              id="qs-search-input"
              type="search"
              className="qs-search__input"
              placeholder="Search questions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search questions"
            />
          </div>

          <div className="qs-filter-group" role="group" aria-label="Filter by category">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`qs-filter-btn ${category === cat ? 'qs-filter-btn--active' : ''}`}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="qs-filter-group" role="group" aria-label="Filter by difficulty">
            {DIFFICULTIES.map(d => (
              <button
                key={d}
                className={`qs-filter-btn ${difficulty === d ? 'qs-filter-btn--active' : ''}`}
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
              >
                {d === 'all' ? 'All levels' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="qs-count mono">{filtered.length} question{filtered.length !== 1 ? 's' : ''}</p>

        {/* Question list */}
        {filtered.length === 0 ? (
          <div className="qs-empty">
            <p className="qs-empty__title">No questions match your filters.</p>
            <button className="qs-empty__reset" onClick={() => { setSearch(''); setCategory('All'); setDifficulty('all'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="qs-list">
            {filtered.map((q, i) => (
              <motion.button
                key={q.id}
                className="qs-item"
                onClick={() => navigate(`/questions/${q.id}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                aria-label={`${q.question} — ${q.difficulty}, ${q.probability}% probability`}
              >
                <div className="qs-item__left">
                  <div className="qs-item__meta">
                    <Badge variant={q.difficulty === 'hard' ? 'error' : q.difficulty === 'medium' ? 'warning' : 'success'} size="xs">
                      {q.difficulty}
                    </Badge>
                    <Badge variant="neutral" size="xs">{q.category}</Badge>
                  </div>
                  <p className="qs-item__question">{q.question}</p>
                  <p className="qs-item__hint mono">↳ {q.evidence.filename}</p>
                </div>
                <div className="qs-item__right">
                  <div className="qs-item__prob">
                    <span className="qs-item__prob-val">{q.probability}%</span>
                    <span className="qs-item__prob-label">likely</span>
                  </div>
                  <ChevronRight size={14} className="qs-item__arrow" aria-hidden="true" />
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
