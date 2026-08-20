const badgeConfig = {
  verification: {
    unverified: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    compromised: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  evidenceType: {
    image: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    document: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    video: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    audio: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    network_log: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    system_log: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
  role: {
    admin: 'bg-red-500/20 text-red-400 border-red-500/30',
    evidence_manager: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    investigator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  classification: {
    public: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    confidential: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    secret: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  status: {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    deleted: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export default function StatusBadge({ type, value }) {
  const config = badgeConfig[type];
  const classes = config?.[value] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const label = value?.replace(/_/g, ' ') || 'unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${classes}`}>
      {label}
    </span>
  );
}
