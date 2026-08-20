import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function VerifyResult({ result }) {
  const isVerified = result.verificationStatus === 'verified' || result.isVerified === true;
  const isCompromised = result.verificationStatus === 'compromised' || result.isCompromised === true;

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${
        isVerified
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : isCompromised
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        {isVerified ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
        ) : isCompromised ? (
          <XCircle className="w-8 h-8 text-red-400 shrink-0" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-yellow-400 shrink-0" />
        )}
        <div>
          <p className={`text-lg font-semibold ${
            isVerified ? 'text-emerald-400' : isCompromised ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {isVerified ? 'Evidence Verified' : isCompromised ? 'Evidence Compromised!' : 'Verification Inconclusive'}
          </p>
          <p className="text-sm text-slate-400">
            {isVerified
              ? 'The evidence integrity is intact and blockchain records are consistent.'
              : isCompromised
              ? 'WARNING: Tamper detected! The evidence may have been modified.'
              : 'Unable to determine verification status.'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {result.blockchainVerification !== undefined && (
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <span className="text-sm text-slate-400">Blockchain Hash Continuity</span>
            <span className={`text-sm font-medium ${result.blockchainVerification ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.blockchainVerification ? '✓ Intact' : '✗ Broken'}
            </span>
          </div>
        )}
        {result.integrityMatch !== undefined && (
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <span className="text-sm text-slate-400">Integrity Hash Match</span>
            <span className={`text-sm font-medium ${result.integrityMatch ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.integrityMatch ? '✓ Match' : '✗ Mismatch'}
            </span>
          </div>
        )}
        {result.chainOfCustody && (
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <span className="text-sm text-slate-400">Custody Events</span>
            <span className="text-sm font-medium text-white">{result.chainOfCustody.length} recorded</span>
          </div>
        )}
      </div>
    </div>
  );
}
