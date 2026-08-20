import React, { useState, useEffect } from 'react';
import { UserProjectDetail } from './UserDashboard';
import { DetailedRiskProfileData } from './DetailedRiskProfileForm';
import {
  X,
  Upload,
  Image,
  FileText,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  Edit3,
  Layers,
  MapPin,
  Landmark,
  FileSpreadsheet,
  Building,
  Check
} from 'lucide-react';

export type EditSectionType = 'overview' | 'land' | 'bankability' | 'documents' | 'advisory' | 'all';

interface ProjectEditModalProps {
  project: UserProjectDetail;
  isOpen: boolean;
  initialSection?: EditSectionType;
  onClose: () => void;
  onSave: (updatedProject: Partial<UserProjectDetail>) => void;
}

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  initialSection = 'all',
  onClose,
  onSave
}) => {
  const [activeSection, setActiveSection] = useState<EditSectionType>(initialSection);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const [formData, setFormData] = useState({
    projectName: project.projectName || '',
    industry: project.industry || '',
    location: project.location || '',
    totalCostCr: project.totalCostCr || 0,
    equityPercent: project.equityPercent || 25,
    landStatus: project.landStatus || '',
    collateralStatus: project.collateralStatus || '',
    promoterExp: project.promoterExp || '',
    notes: project.notes || '',
    photoOrLogo: project.photoOrLogo || '',
    dprFile: project.dprFile || null,
    cmaFile: project.cmaFile || null,
    assignedTeam: project.assignedTeam || '',
    timelineDate: project.timelineDate || new Date().toISOString().split('T')[0],
    timelineTime: project.timelineTime || '10:00 AM',
    
    // Risk profile fields
    industryExperience: project.riskProfileData?.industryExperience || 'More than 10 Years',
    educationalBackground: project.riskProfileData?.educationalBackground || 'Engineering / Technical Degree',
    businessConstitution: project.riskProfileData?.businessConstitution || 'Private Limited Company',
    businessVintage: project.riskProfileData?.businessVintage || 'More than 8 Years',
    contributionType: project.riskProfileData?.contributionType || 'Combination of Cash & Land',
    collateralCoveragePct: project.riskProfileData?.collateralCoveragePct || '125',
    cibilScore: project.riskProfileData?.cibilScore || '780',
    managementTeamSize: project.riskProfileData?.managementTeamSize || '6',
    technicalWorkforceCount: project.riskProfileData?.technicalWorkforceCount || '25'
  });

  const [dprError, setDprError] = useState<string | null>(null);
  const [cmaError, setCmaError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Logo / Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoError('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('Logo image size should not exceed 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, photoOrLogo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // DPR Document upload handler
  const handleDprUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDprError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setDprError('DPR file must be a document (.pdf, .doc, .docx, .xls, .xlsx).');
      return;
    }

    setFormData(prev => ({
      ...prev,
      dprFile: {
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    }));
  };

  // CMA Document upload handler
  const handleCmaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCmaError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.xls', '.xlsx'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setCmaError('CMA report must be an Excel sheet or PDF (.pdf, .xls, .xlsx).');
      return;
    }

    setFormData(prev => ({
      ...prev,
      cmaFile: {
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    }));
  };

  const handleQuickAssignTeam = (teamName: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTeam: teamName,
      timelineDate: new Date().toISOString().split('T')[0],
      timelineTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cost = parseFloat(String(formData.totalCostCr)) || 0;
    const eqPct = parseFloat(String(formData.equityPercent)) || 25;
    const equityCr = parseFloat(((cost * eqPct) / 100).toFixed(2));
    const loanCr = parseFloat((cost - equityCr).toFixed(2));

    const updatedRiskProfile: DetailedRiskProfileData = {
      ...(project.riskProfileData || {}),
      industryExperience: formData.industryExperience,
      educationalBackground: formData.educationalBackground,
      businessConstitution: formData.businessConstitution,
      businessVintage: formData.businessVintage,
      contributionType: formData.contributionType,
      collateralCoveragePct: formData.collateralCoveragePct,
      cibilScore: formData.cibilScore,
      managementTeamSize: formData.managementTeamSize,
      technicalWorkforceCount: formData.technicalWorkforceCount,
      debtEquityRatio: `${100 - eqPct}:${eqPct}`
    };

    onSave({
      projectName: formData.projectName,
      industry: formData.industry,
      location: formData.location,
      totalCostCr: cost,
      promoterContribCr: equityCr,
      loanRequiredCr: loanCr,
      equityPercent: eqPct,
      debtPercent: 100 - eqPct,
      landStatus: formData.landStatus,
      collateralStatus: formData.collateralStatus,
      promoterExp: formData.promoterExp,
      notes: formData.notes,
      photoOrLogo: formData.photoOrLogo,
      dprFile: formData.dprFile,
      cmaFile: formData.cmaFile,
      assignedTeam: formData.assignedTeam,
      timelineDate: formData.timelineDate,
      timelineTime: formData.timelineTime,
      riskProfileData: updatedRiskProfile
    });
    onClose();
  };

  const tabs: { id: EditSectionType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Financials & Capex', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'land', label: 'Land & Collateral', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'bankability', label: 'Bankability Profile', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'documents', label: 'DPR & CMA Docs', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'advisory', label: 'Team & Timeline', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'all', label: 'All Sections', icon: <Edit3 className="w-3.5 h-3.5" /> }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full text-slate-900 shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-manrope text-xl font-extrabold text-white">
                  Edit Project Section
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase">
                  {activeSection === 'all' ? 'Full Project' : activeSection}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {project.projectName} • Tailor specific parameters or all sections.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100/80 border-b border-slate-200 overflow-x-auto shrink-0 scrollbar-none px-4">
          {tabs.map(tab => {
            const isSelected = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 font-inter bg-slate-50/50">
          
          {/* SECTION: OVERVIEW & FINANCIALS */}
          {(activeSection === 'overview' || activeSection === 'all') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Project Overview &amp; Financial Structure</span>
                </h3>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  Capex &amp; Debt Metrics
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={e => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Project Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Total Capex Cost (₹ Cr) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.totalCostCr}
                    onChange={e => setFormData(prev => ({ ...prev, totalCostCr: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Promoter Equity: {formData.equityPercent}%</span>
                    <span className="font-bold text-blue-600">Debt Required: {100 - formData.equityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={formData.equityPercent}
                    onChange={e => setFormData(prev => ({ ...prev, equityPercent: parseInt(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>₹ {((formData.totalCostCr * formData.equityPercent) / 100).toFixed(2)} Cr (Equity)</span>
                    <span>₹ {((formData.totalCostCr * (100 - formData.equityPercent)) / 100).toFixed(2)} Cr (Loan)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: LAND & COLLATERAL */}
          {(activeSection === 'land' || activeSection === 'all') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>Land Status &amp; Collateral Security</span>
                </h3>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  Asset Backing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Land Acquisition Status</label>
                  <input
                    type="text"
                    value={formData.landStatus}
                    onChange={e => setFormData(prev => ({ ...prev, landStatus: e.target.value }))}
                    placeholder="e.g. Owned & Registered, TSIIC Allotted"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Collateral Title &amp; Mortgage</label>
                  <input
                    type="text"
                    value={formData.collateralStatus}
                    onChange={e => setFormData(prev => ({ ...prev, collateralStatus: e.target.value }))}
                    placeholder="e.g. Freehold Clear Title, Machinery Hypothecation"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Promoter Experience</label>
                  <input
                    type="text"
                    value={formData.promoterExp}
                    onChange={e => setFormData(prev => ({ ...prev, promoterExp: e.target.value }))}
                    placeholder="e.g. 10+ Years in Manufacturing"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: BANKABILITY & UNDERWRITING PROFILE */}
          {(activeSection === 'bankability' || activeSection === 'all') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bankability &amp; Underwriting Risk Profile</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Credit Committee Norms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Business Constitution</label>
                  <select
                    value={formData.businessConstitution}
                    onChange={e => setFormData(prev => ({ ...prev, businessConstitution: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Registered Partnership Firm">Registered Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Business Vintage</label>
                  <select
                    value={formData.businessVintage}
                    onChange={e => setFormData(prev => ({ ...prev, businessVintage: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="More than 8 Years">More than 8 Years</option>
                    <option value="4 to 7 Years">4 to 7 Years</option>
                    <option value="1 to 3 Years">1 to 3 Years</option>
                    <option value="New / Greenfield Startup (< 1 Year)">New / Greenfield Startup (&lt; 1 Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Collateral Coverage (%)</label>
                  <input
                    type="number"
                    value={formData.collateralCoveragePct}
                    onChange={e => setFormData(prev => ({ ...prev, collateralCoveragePct: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">CIBIL / Commercial Credit Score</label>
                  <input
                    type="number"
                    value={formData.cibilScore}
                    onChange={e => setFormData(prev => ({ ...prev, cibilScore: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Management Team Size</label>
                  <input
                    type="number"
                    value={formData.managementTeamSize}
                    onChange={e => setFormData(prev => ({ ...prev, managementTeamSize: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Technical Workforce Count</label>
                  <input
                    type="number"
                    value={formData.technicalWorkforceCount}
                    onChange={e => setFormData(prev => ({ ...prev, technicalWorkforceCount: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: DPR & CMA DOCUMENTS & LOGO */}
          {(activeSection === 'documents' || activeSection === 'all') && (
            <div className="space-y-4">
              {/* Photo or Logo Upload */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Image className="w-4 h-4 text-blue-600" />
                    <span>Promoter Photo / Company Logo</span>
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG, WebP (Max 5MB)</span>
                </div>

                <div className="flex items-center gap-4">
                  {formData.photoOrLogo ? (
                    <div className="relative group">
                      <img
                        src={formData.photoOrLogo}
                        alt="Logo Preview"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photoOrLogo: '' }))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  <div className="flex-1 text-xs text-slate-600">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.photoOrLogo ? 'Change Photo / Logo' : 'Upload Photo or Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Shown on your Executive Project Teaser &amp; Bankable DPR summary.
                    </p>
                    {logoError && <p className="text-red-500 text-[11px] mt-1 font-medium">{logoError}</p>}
                  </div>
                </div>
              </div>

              {/* DPR & CMA Uploads */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Bankable Documentation (DPR &amp; CMA Only)</span>
                  </label>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    PDF &amp; Excel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DPR Upload Box */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">1. DPR Document (Detailed Project Report)</span>
                      <span className="text-[10px] text-slate-400">PDF, Word, Excel</span>
                    </div>
                    {formData.dprFile ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-emerald-900 truncate">{formData.dprFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, dprFile: null }))}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg hover:border-blue-500 text-xs font-bold text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload DPR File</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={handleDprUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    {dprError && <p className="text-red-500 text-[11px] font-medium">{dprError}</p>}
                  </div>

                  {/* CMA Upload Box */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">2. CMA Data / Banking Projections</span>
                      <span className="text-[10px] text-slate-400">Excel or PDF</span>
                    </div>
                    {formData.cmaFile ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-emerald-900 truncate">{formData.cmaFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, cmaFile: null }))}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-lg hover:border-blue-500 text-xs font-bold text-slate-700 hover:text-blue-600 cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload CMA Report</span>
                        <input
                          type="file"
                          accept=".pdf,.xls,.xlsx"
                          onChange={handleCmaUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    {cmaError && <p className="text-red-500 text-[11px] font-medium">{cmaError}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: TEAM & TIMELINE */}
          {(activeSection === 'advisory' || activeSection === 'all') && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Assigned Team, Timeline &amp; Notes</span>
                </label>
                {formData.assignedTeam ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Assigned</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Unassigned
                  </span>
                )}
              </div>

              {!formData.assignedTeam ? (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>This project is currently not assigned to an advisory team.</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickAssignTeam('CA Debt Appraisal Desk')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Assign to CA Debt Appraisal Desk
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAssignTeam('Project DPR & Feasibility Team')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Assign to DPR & Feasibility Team
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Assigned Team</label>
                      <select
                        value={formData.assignedTeam}
                        onChange={e => setFormData(prev => ({ ...prev, assignedTeam: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CA Debt Appraisal Desk">CA Debt Appraisal Desk</option>
                        <option value="Project DPR & Feasibility Team">Project DPR & Feasibility Team</option>
                        <option value="Bank Syndication Officers">Bank Syndication Officers</option>
                        <option value="Inisio Executive Committee">Inisio Executive Committee</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Timeline Date</label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="date"
                          value={formData.timelineDate}
                          onChange={e => setFormData(prev => ({ ...prev, timelineDate: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Timeline Time</label>
                      <div className="relative">
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="e.g. 10:30 AM"
                          value={formData.timelineTime}
                          onChange={e => setFormData(prev => ({ ...prev, timelineTime: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Special Notes / Bank Preferences</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Target bank preferences, special concessions, or collateral remarks..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Section Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
