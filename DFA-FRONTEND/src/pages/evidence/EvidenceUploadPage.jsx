import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evidenceAPI } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import { Upload, CheckCircle2, ArrowRight, ArrowLeft, X, File } from 'lucide-react';
import toast from 'react-hot-toast';

const evidenceTypes = [
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'network_log', label: 'Network Log' },
  { value: 'system_log', label: 'System Log' },
  { value: 'other', label: 'Other' },
];

export default function EvidenceUploadPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    caseId: '',
    title: '',
    type: 'document',
    description: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    
    // Convert to FormData to support file upload
    const formData = new FormData();
    formData.append('caseId', form.caseId);
    formData.append('title', form.title);
    formData.append('type', form.type);
    formData.append('description', form.description);
    formData.append('tags', JSON.stringify(form.tags));
    formData.append('file', file);

    try {
      // Modify evidenceAPI.upload in axios.js to allow FormData passing
      const res = await evidenceAPI.upload(formData);
      setResult(res.data);
      setStep(3);
      toast.success('Evidence uploaded and encrypted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = form.caseId && form.title && form.type && file;

  return (
    <div>
      <PageHeader title="Upload Evidence" description="Submit new evidence for encryption and AWS S3 storage" />

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm hidden sm:inline ${step >= s ? 'text-white' : 'text-slate-500'}`}>
              {s === 1 ? 'Case Info' : s === 2 ? 'Details' : 'Complete'}
            </span>
            {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-cyan-600' : 'bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Case Info */}
      {step === 1 && (
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Case Information & File</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Evidence File *</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={`px-4 py-6 border-2 border-dashed rounded-xl text-center transition-colors ${file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-600 bg-slate-800 hover:border-slate-500 hover:bg-slate-700'}`}>
                    <Upload className={`w-6 h-6 mx-auto mb-2 ${file ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <p className="text-sm text-slate-300 font-medium">{file ? file.name : 'Click to select a file'}</p>
                    <p className="text-xs text-slate-500 mt-1">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'All file types supported'}</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Case ID *</label>
              <input
                type="text"
                name="caseId"
                value={form.caseId}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                placeholder="e.g. CASE-2024-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                placeholder="Evidence title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
              >
                {evidenceTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Details & Review */}
      {step === 2 && (
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Details & Tags</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors resize-none"
                placeholder="Brief description of the evidence..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
                >
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-slate-500 hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Review Summary */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-3">Review Summary</h4>
              <div className="bg-slate-800 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">File</span>
                  <span className="text-cyan-400 flex items-center gap-1"><File className="w-3 h-3" /> {file?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Case ID</span>
                  <span className="text-white font-mono">{form.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Title</span>
                  <span className="text-white">{form.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white capitalize">{form.type.replace(/_/g, ' ')}</span>
                </div>
                {form.description && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Description</span>
                    <span className="text-white text-right max-w-[200px] truncate">{form.description}</span>
                  </div>
                )}
                {form.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tags</span>
                    <span className="text-white">{form.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Encrypting & Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload & Encrypt
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && result && (
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 p-8 max-w-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Evidence Uploaded Successfully!</h3>
          <p className="text-slate-400 mb-6">
            Your evidence has been encrypted with MKHE, stored in AWS S3, and registered on the blockchain.
          </p>

          <div className="bg-slate-800 rounded-lg p-4 text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence ID</span>
              <span className="text-cyan-400 font-mono">{result.evidence?.evidenceId || result.evidenceId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blockchain Hash</span>
              <span className="text-purple-400 font-mono text-xs truncate max-w-[250px]">
                {result.evidence?.blockchainHash || result.blockchainHash || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Encryption</span>
              <span className="text-emerald-400">MKHE Multi-Key Encrypted</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storage</span>
              <span className="text-blue-400">AWS S3</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(`/evidence/${result.evidence?.evidenceId || result.evidenceId}`)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              View Evidence
            </button>
            <button
              onClick={() => {
                setStep(1);
                setForm({ caseId: '', title: '', type: 'document', description: '', tags: [] });
                setFile(null);
                setResult(null);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
