export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-700">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-slate-400 mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="mt-3 sm:mt-0 flex gap-2">{actions}</div>}
    </div>
  );
}
