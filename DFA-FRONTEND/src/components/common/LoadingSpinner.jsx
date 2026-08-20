import { Loader2 } from 'lucide-react';

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', text }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <Loader2 className={`${sizes[size]} text-cyan-500 animate-spin`} />
      {text && <p className="text-slate-400 mt-3 text-sm">{text}</p>}
    </div>
  );
}
