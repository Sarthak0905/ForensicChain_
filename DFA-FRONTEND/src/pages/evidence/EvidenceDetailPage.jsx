import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evidenceAPI } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ChainOfCustody from '../../components/evidence/ChainOfCustody';
import VerifyResult from '../../components/evidence/VerifyResult';
import {
  ArrowLeft,
  ShieldCheck,
  Unlock,
  FolderLock,
  Tag,
  MapPin,
  Clock,
  Hash,
  Lock,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function EvidenceDetailPage() {
  const { id } = useParams();
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [decryptedData, setDecryptedData] = useState(null);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const res = await evidenceAPI.getById(id);
        setEvidence(res.data.evidence || res.data);
      } catch (err) {
        console.error('Error fetching evidence:', err);
        toast.error('Failed to load evidence details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, [id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await evidenceAPI.verify(id);
      setVerifyResult(res.data);
      setShowVerifyModal(true);
      // Update evidence verification status locally
      setEvidence((prev) => ({
        ...prev,
        verificationStatus: res.data.verificationStatus || prev.verificationStatus,
      }));
      toast.success('Verification complete');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDecrypt = async () => {
    setDecrypting(true);
    try {
      const res = await evidenceAPI.decrypt(id);
      setDecryptedData(res.data);
      setShowDecryptModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Decryption failed');
    } finally {
      setDecrypting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading evidence..." />;

  if (!evidence) {
    return (
      <div className="text-center py-16">
        <FolderLock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Evidence Not Found</h2>
        <p className="text-slate-400 mb-4">The requested evidence could not be found.</p>
        <Link to="/evidence" className="text-cyan-400 hover:text-cyan-300">
          ← Back to Evidence List
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={evidence.title}
        description={`Evidence ID: ${evidence.evidenceId}`}
        actions={
          <div className="flex gap-2">
            <Link
              to="/evidence"
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
            <button
              onClick={handleDecrypt}
              disabled={decrypting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Unlock className="w-4 h-4" />
              {decrypting ? 'Decrypting...' : 'Decrypt'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Evidence ID" value={evidence.evidenceId} mono />
              <InfoItem label="Case ID" value={evidence.caseId} mono />
              <InfoItem label="Type">
                <StatusBadge type="evidenceType" value={evidence.type} />
              </InfoItem>
              <InfoItem label="Status">
                <StatusBadge type="verification" value={evidence.verificationStatus} />
              </InfoItem>
              <InfoItem label="Created" value={evidence.createdAt ? format(new Date(evidence.createdAt), 'PPpp') : '—'} />
              <InfoItem label="Updated" value={evidence.updatedAt ? format(new Date(evidence.updatedAt), 'PPpp') : '—'} />
            </div>
            {evidence.description && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <p className="text-sm text-slate-400">{evidence.description}</p>
              </div>
            )}
          </div>

          {/* Encryption Info */}
          {evidence.encryptionInfo && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" /> Encryption Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Method" value={evidence.encryptionInfo.encryptionMethod || 'MKHE'} />
                <InfoItem label="Key Layers" value={evidence.encryptionInfo.multipleKeys?.length || '—'} />
                <InfoItem label="Key Index" value={evidence.encryptionInfo.keyIndex ?? '—'} />
              </div>
              {evidence.encryptionInfo.encryptedDataHash && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-1">Encrypted Data Hash</p>
                  <p className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-2 rounded break-all">
                    {evidence.encryptionInfo.encryptedDataHash}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Integrity */}
          <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" /> Integrity
            </h3>
            <div className="space-y-3">
              {evidence.integrityHash && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Integrity Hash (SHA-256)</p>
                  <p className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-2 rounded break-all">
                    {evidence.integrityHash}
                  </p>
                </div>
              )}
              {evidence.blockchainHash && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Blockchain Hash</p>
                  <p className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-2 rounded break-all">
                    {evidence.blockchainHash}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chain of Custody */}
          {evidence.chainOfCustody && evidence.chainOfCustody.length > 0 && (
            <ChainOfCustody entries={evidence.chainOfCustody} />
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Tags */}
          {evidence.tags && evidence.tags.length > 0 && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-yellow-400" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {evidence.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {evidence.location?.name && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" /> Location
              </h3>
              <p className="text-sm text-slate-300">{evidence.location.name}</p>
              {evidence.location.coordinates && (
                <p className="text-xs text-slate-500 mt-1">
                  {evidence.location.coordinates.latitude}, {evidence.location.coordinates.longitude}
                </p>
              )}
            </div>
          )}

          {/* Access Control */}
          {evidence.accessControl && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-400" /> Access Control
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Restricted</span>
                  <span className="text-white">{evidence.accessControl.restricted ? 'Yes' : 'No'}</span>
                </div>
                {evidence.accessControl.classificationLevel && (
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-slate-400">Classification</span>
                    <StatusBadge type="classification" value={evidence.accessControl.classificationLevel} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          {evidence.metadata && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Forensic Metadata
              </h3>
              <div className="space-y-2 text-sm">
                {evidence.metadata.acquiredDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Acquired</span>
                    <span className="text-slate-300">{format(new Date(evidence.metadata.acquiredDate), 'PP')}</span>
                  </div>
                )}
                {evidence.metadata.sourceDevice && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source Device</span>
                    <span className="text-slate-300">{evidence.metadata.sourceDevice}</span>
                  </div>
                )}
                {evidence.metadata.digitalForensicTools && (
                  <div>
                    <span className="text-slate-400">Tools</span>
                    <p className="text-slate-300 text-xs mt-0.5">{evidence.metadata.digitalForensicTools}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verify Result Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Verification Result" size="lg">
        {verifyResult && <VerifyResult result={verifyResult} />}
      </Modal>

      {/* Decrypt Modal */}
      <Modal isOpen={showDecryptModal} onClose={() => setShowDecryptModal(false)} title="Decrypted Evidence" size="lg">
        {decryptedData && (
          <div>
            <p className="text-sm text-slate-300 mb-3">The evidence has been successfully decrypted:</p>
            <pre className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 overflow-auto max-h-96 font-mono border border-slate-700">
              {typeof decryptedData === 'string'
                ? decryptedData
                : JSON.stringify(decryptedData.decryptedData || decryptedData, null, 2)}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}

function InfoItem({ label, value, mono, children }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      {children || <p className={`text-sm text-slate-200 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>}
    </div>
  );
}
