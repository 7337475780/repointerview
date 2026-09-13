import { Database, Key, List, FileCode } from 'lucide-react';
import Badge from '../ui/Badge';

const DatabaseSchemaViewer = ({ database }) => {
  if (!database || (!database.hasSchema && database.databaseTechnologies.length === 0)) {
    return null;
  }

  const { models = [], databaseTechnologies = [], ormTechnologies = [] } = database;

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Database size={18} className="text-accent" />
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Database & ORM Schema Models ({models.length})
            </h3>
            <p className="text-xs text-text-tertiary">
              {[...databaseTechnologies, ...ormTechnologies].map(t => t.name).join(', ') || 'Schema Data Models'}
            </p>
          </div>
        </div>
      </div>

      {models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <div
              key={model.name}
              className="bg-bg-elevated border border-border-subtle rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="font-mono text-sm font-bold text-accent">
                  model {model.name}
                </span>
                <span className="text-2xs font-mono text-text-tertiary">
                  {model.fields.length} fields
                </span>
              </div>

              <div className="flex flex-col gap-1 text-xs font-mono max-h-40 overflow-y-auto">
                {model.fields.map((field) => (
                  <div key={field.name} className="flex items-center justify-between py-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      {field.isId && <Key size={10} className="text-warning flex-shrink-0" />}
                      <span className={field.isId ? 'text-warning font-semibold' : 'text-text-primary'}>
                        {field.name}
                      </span>
                    </div>
                    <span className="text-2xs text-text-tertiary">{field.type}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-text-tertiary p-4 bg-bg-elevated rounded-xl border border-border-subtle">
          Database client detected via dependencies, but no static schema models were found in candidate files.
        </div>
      )}
    </div>
  );
};

export default DatabaseSchemaViewer;
