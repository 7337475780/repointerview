import { useState } from 'react';
import { Sun, Moon, Laptop, Keyboard, User, Sliders, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SHORTCUTS = [
  { key: '⌘ + K / Ctrl + K', description: 'Open command palette & quick search' },
  { key: '/', description: 'Quick search questions in repository' },
  { key: 'Esc', description: 'Close modals, drawers, and command palette' },
  { key: '↑ / ↓', description: 'Navigate command palette results' },
  { key: '↵ Enter', description: 'Select command or submit response' },
];

const Settings = ({ theme, onToggleTheme }) => {
  const [name, setName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@example.com');
  const [interviewDuration, setInterviewDuration] = useState('15');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-10">
      {/* Header */}
      <div className="border-b border-border-subtle pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">Configuration</p>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mt-1">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">
          Customize your interview environment, theme appearance, and personal preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-10">
        {/* Profile section */}
        <section className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-4">
            <User size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Developer Profile</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </section>

        {/* Appearance section */}
        <section className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-4">
            <Sun size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Appearance & Theme</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-accent-subtle border-accent-border text-accent font-semibold shadow-xs'
                  : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => {
                if (theme !== 'dark') onToggleTheme();
              }}
            >
              <div className="flex items-center gap-3">
                <Moon size={16} />
                <span className="text-xs">Dark Mode (Claude Stone)</span>
              </div>
              {theme === 'dark' && <Check size={14} />}
            </button>

            <button
              type="button"
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-accent-subtle border-accent-border text-accent font-semibold shadow-xs'
                  : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => {
                if (theme !== 'light') onToggleTheme();
              }}
            >
              <div className="flex items-center gap-3">
                <Sun size={16} />
                <span className="text-xs">Light Mode (Warm Sand)</span>
              </div>
              {theme === 'light' && <Check size={14} />}
            </button>
          </div>
        </section>

        {/* Interview Preferences */}
        <section className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-4">
            <Sliders size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Interview Defaults</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="duration" className="text-xs font-semibold text-text-secondary">
                Default Target Session Time
              </label>
              <select
                id="duration"
                className="w-full bg-bg-elevated border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent"
                value={interviewDuration}
                onChange={e => setInterviewDuration(e.target.value)}
              >
                <option value="10">10 Minutes (Quick warmup)</option>
                <option value="15">15 Minutes (Standard round)</option>
                <option value="30">30 Minutes (Deep architectural dive)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts Reference */}
        <section className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-border-subtle pb-4">
            <Keyboard size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Keyboard Shortcuts</h2>
          </div>
          <div className="flex flex-col divide-y divide-border-subtle">
            {SHORTCUTS.map(sc => (
              <div key={sc.key} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-text-secondary">{sc.description}</span>
                <kbd className="font-mono text-2xs bg-bg-elevated text-text-primary px-2 py-0.5 rounded border border-border-subtle">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          {saved ? (
            <span className="text-xs text-success flex items-center gap-1">
              <Check size={14} /> Preferences saved successfully.
            </span>
          ) : (
            <span className="text-2xs text-text-disabled">Stored locally in your environment.</span>
          )}
          <Button type="submit" variant="primary" size="md">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
