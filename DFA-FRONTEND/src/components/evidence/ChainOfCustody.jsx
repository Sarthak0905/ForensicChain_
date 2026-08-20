import { PlusCircle, Eye, ShieldCheck, Edit } from 'lucide-react';
import { format } from 'date-fns';

const actionConfig = {
  created: { icon: PlusCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  accessed: { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  verified: { icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  modified: { icon: Edit, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
};

export default function ChainOfCustody({ entries }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
      <h3 className="text-base font-semibold text-white mb-4">Chain of Custody</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-700" />

        <div className="space-y-4">
          {entries.map((entry, index) => {
            const config = actionConfig[entry.action] || actionConfig.accessed;
            const Icon = config.icon;
            return (
              <div key={index} className="relative flex gap-4 pl-1">
                {/* Icon */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} border ${config.border} shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium capitalize ${config.color}`}>{entry.action}</span>
                    {entry.performedByName && (
                      <span className="text-xs text-slate-500">by {entry.performedByName}</span>
                    )}
                  </div>
                  {entry.details && (
                    <p className="text-xs text-slate-400 mt-0.5">{entry.details}</p>
                  )}
                  {entry.timestamp && (
                    <p className="text-xs text-slate-600 mt-1">
                      {format(new Date(entry.timestamp), 'PPpp')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
