export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && <Icon className="w-16 h-16 text-slate-600 mb-4" />}
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-slate-500 text-sm text-center max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
