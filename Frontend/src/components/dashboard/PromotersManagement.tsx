import React, { useState } from 'react';
import { PromoterDetail } from '../../types';
import {
  Users2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Award,
  UserCheck,
  Building2,
  X,
  CreditCard
} from 'lucide-react';

interface PromotersManagementProps {
  promoters: PromoterDetail[];
  onUpdatePromoters: (updatedList: PromoterDetail[]) => void;
  primaryPromoterName?: string;
}

export const PromotersManagement: React.FC<PromotersManagementProps> = ({
  promoters,
  onUpdatePromoters,
  primaryPromoterName = 'Primary Promoter'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for adding/editing promoter
  const [name, setName] = useState('');
  const [pan, setPan] = useState('');
  const [din, setDin] = useState('');
  const [experienceYears, setExperienceYears] = useState<string | number>('10');
  const [qualification, setQualification] = useState('B.Tech / Engineering');
  const [shareholdingPct, setShareholdingPct] = useState<string | number>('50');
  const [role, setRole] = useState('Managing Director');
  const [kycStatus, setKycStatus] = useState<'Verified' | 'Pending' | 'Uploaded'>('Verified');
  const [netWorthCr, setNetWorthCr] = useState<string | number>('5.0');
  const [cibilScore, setCibilScore] = useState<string | number>('780');

  // Initialize with at least primary promoter if empty, with no dummy PAN or DIN
  const activePromoters: PromoterDetail[] = promoters && promoters.length > 0 ? promoters : [
    {
      id: 'promoter-1',
      name: primaryPromoterName || 'Lead Promoter',
      pan: '',
      din: '',
      experienceYears: 12,
      qualification: 'B.Tech / MBA (Operations)',
      shareholdingPct: 70,
      role: 'Managing Director & Promoter',
      kycStatus: 'Pending' as const,
      netWorthCr: 6.5,
      cibilScore: undefined
    }
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setPan('');
    setDin('');
    setExperienceYears('8');
    setQualification('Graduate / Post Graduate');
    setShareholdingPct('30');
    setRole('Executive Director / Co-Promoter');
    setKycStatus('Pending');
    setNetWorthCr('3.0');
    setCibilScore('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PromoterDetail) => {
    setEditingId(p.id);
    setName(p.name);
    setPan(p.pan || '');
    setDin(p.din || '');
    setExperienceYears(p.experienceYears);
    setQualification(p.qualification);
    setShareholdingPct(p.shareholdingPct);
    setRole(p.role);
    setKycStatus(p.kycStatus || 'Pending');
    setNetWorthCr(p.netWorthCr || '');
    setCibilScore(p.cibilScore || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      // Update existing
      const updated = activePromoters.map(p => {
        if (p.id === editingId) {
          return {
            ...p,
            name,
            pan,
            din,
            experienceYears: Number(experienceYears) || 0,
            qualification,
            shareholdingPct: Number(shareholdingPct) || 0,
            role,
            kycStatus,
            netWorthCr: Number(netWorthCr) || 0,
            cibilScore: cibilScore ? Number(cibilScore) : undefined
          };
        }
        return p;
      });
      onUpdatePromoters(updated);
    } else {
      // Create new
      const newPromoter: PromoterDetail = {
        id: `promoter-${Date.now()}`,
        name,
        pan,
        din,
        experienceYears: Number(experienceYears) || 0,
        qualification,
        shareholdingPct: Number(shareholdingPct) || 0,
        role,
        kycStatus,
        netWorthCr: Number(netWorthCr) || 0,
        cibilScore: cibilScore ? Number(cibilScore) : undefined
      };
      onUpdatePromoters([...activePromoters, newPromoter]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (activePromoters.length <= 1) {
      alert('At least one primary promoter must remain in the project profile.');
      return;
    }
    const filtered = activePromoters.filter(p => p.id !== id);
    onUpdatePromoters(filtered);
  };

  const totalShareholding = activePromoters.reduce((sum, p) => sum + (Number(p.shareholdingPct) || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Promoters &amp; Board of Directors Management
            </h3>
            <p className="text-xs text-zinc-500">
              Capture profiles, DIN/PAN, experience, and equity shareholding for lender due diligence.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Co-Promoter / Director</span>
        </button>
      </div>

      {/* Promoters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activePromoters.map((p, index) => (
          <div
            key={p.id}
            className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center border border-blue-200">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    <span>{p.name}</span>
                    {index === 0 && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                        Primary
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-zinc-500">{p.role || 'Director'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1 text-zinc-400 hover:text-blue-600 rounded cursor-pointer"
                  title="Edit promoter"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {activePromoters.length > 1 && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Remove promoter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-100">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Equity Share</span>
                <span className="font-bold text-zinc-800">{p.shareholdingPct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Industry Exp</span>
                <span className="font-bold text-zinc-800">{p.experienceYears} Years</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Net Worth</span>
                <span className="font-bold text-zinc-800">₹ {p.netWorthCr || '—'} Cr</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold block">KYC Status</span>
                <span className={`font-bold flex items-center gap-1 ${
                  p.kycStatus === 'Verified' 
                    ? 'text-emerald-700' 
                    : p.kycStatus === 'Uploaded' 
                    ? 'text-blue-700' 
                    : 'text-amber-700'
                }`}>
                  {p.kycStatus === 'Verified' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                  )}
                  <span>{p.kycStatus === 'Verified' ? 'Verified' : p.kycStatus === 'Uploaded' ? 'Documents Uploaded' : 'Pending Verification'}</span>
                </span>
              </div>
            </div>

            {/* Identifiers & Details */}
            <div className="text-[11px] text-zinc-600 bg-white p-2.5 rounded-lg border border-zinc-100 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong className="text-zinc-800">PAN:</strong>{' '}
                {p.pan ? (
                  <span className="font-mono text-zinc-900 font-semibold">{p.pan}</span>
                ) : (
                  <span className="text-zinc-400 italic">Not Provided</span>
                )}
              </span>
              <span>
                <strong className="text-zinc-800">DIN:</strong>{' '}
                {p.din ? (
                  <span className="font-mono text-zinc-900 font-semibold">{p.din}</span>
                ) : (
                  <span className="text-zinc-400 italic">Not Provided</span>
                )}
              </span>
              <span>
                <strong className="text-zinc-800">CIBIL:</strong>{' '}
                {p.cibilScore ? (
                  <span className="font-mono text-zinc-900 font-semibold">{p.cibilScore}</span>
                ) : (
                  <span className="text-zinc-400 italic">Pending Bureau Fetch</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Shareholding Check Warning if not 100% */}
      {totalShareholding !== 100 && (
        <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
          <span>Note: Total recorded promoter shareholding is currently <strong>{totalShareholding}%</strong>. (Ensure 100% cap table for final DPR).</span>
        </div>
      )}

      {/* Modal for Add / Edit Promoter */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-zinc-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">
                {editingId ? 'Edit Promoter Profile' : 'Add New Co-Promoter / Director'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Whole-Time Director"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Shareholding (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={shareholdingPct}
                    onChange={(e) => setShareholdingPct(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Net Worth (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={netWorthCr}
                    onChange={(e) => setNetWorthCr(e.target.value)}
                    placeholder="e.g. 4.5"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">PAN Number <span className="text-zinc-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="Optional (e.g. ABCDE1234F)"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">DIN (Director ID) <span className="text-zinc-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    maxLength={8}
                    value={din}
                    onChange={(e) => setDin(e.target.value)}
                    placeholder="Optional (e.g. 08123456)"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Educational Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. B.Tech / MBA / CA"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Self-Declared CIBIL Score <span className="text-zinc-400 font-normal">(Optional)</span></label>
                  <input
                    type="number"
                    min="300"
                    max="900"
                    value={cibilScore}
                    onChange={(e) => setCibilScore(e.target.value)}
                    placeholder="Optional (e.g. 750)"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Promoter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
