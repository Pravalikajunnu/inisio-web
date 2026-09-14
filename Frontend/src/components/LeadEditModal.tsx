import React, { useState, useEffect } from 'react';
import { LeadRecord, updateLeadRecord } from '../utils/leadStore';
import { validateIndianMobileNumber } from '../utils/validation';
import { AuthUser, PromoterDetail, ProjectDocument } from '../types';
import { DocumentViewerModal, DocumentViewerTarget } from './DocumentViewerModal';
import {
  X,
  Save,
  Edit3,
  Building,
  IndianRupee,
  Layers,
  MapPin,
  User,
  Users,
  FileText,
  FileSpreadsheet,
  Upload,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  Clock,
  Briefcase
} from 'lucide-react';

interface LeadEditModalProps {
  lead: LeadRecord | null;
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({
  lead,
  user,
  isOpen,
  onClose,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'promoters' | 'land' | 'documents' | 'status'>('overview');
  const [formData, setFormData] = useState<Partial<LeadRecord>>({});
  const [promoters, setPromoters] = useState<PromoterDetail[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [viewingDoc, setViewingDoc] = useState<DocumentViewerTarget | null>(null);
  const [newDocCategory, setNewDocCategory] = useState<string>('Company KYC');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        projectName: lead.projectName || '',
        fullName: lead.fullName || '',
        mobile: lead.mobile || '',
        email: lead.email || '',
        industry: lead.industry || '',
        location: lead.location || '',
        status: lead.status || 'In Appraisal',
        totalCostCr: lead.totalCostCr || '',
        loanRequiredCr: lead.loanRequiredCr || '',
        promoterContribCr: lead.promoterContribCr || '',
        landStatus: lead.landStatus || 'Owned / Allotted',
        collateralStatus: lead.collateralStatus || 'Fixed Land & Machinery',
        promoterExp: lead.promoterExp || '5+ Years Experienced',
        assignedTeam: lead.assignedTeam || 'CA Rajesh Sharma (FCA #847201)',
        notes: lead.notes || '',
        feasibilityScore: lead.feasibilityScore || 82,
        bankabilityRating: lead.bankabilityRating || 'Investment Grade (A)',
        financials: lead.financials ? { ...lead.financials } : {
          machineryCostCr: '',
          civilCostCr: '',
          consultancyCostCr: '',
          otherCostsCr: '',
          termLoanCr: '',
          promoterContributionCr: '',
          otherFinanceCr: ''
        }
      });

      // Promoters
      if (lead.promotersList && lead.promotersList.length > 0) {
        setPromoters([...lead.promotersList]);
      } else {
        setPromoters([
          {
            name: lead.fullName || 'Lead Promoter',
            shareholding: '100',
            qualification: 'Graduate / Engineering',
            experience: '10',
            role: 'Managing Director'
          }
        ]);
      }

      // Documents
      const initialDocs: ProjectDocument[] = [];
      if (lead.dprFile) {
        initialDocs.push({
          id: 'dpr-1',
          name: lead.dprFile.name,
          type: 'Detailed Project Report (DPR)',
          size: lead.dprFile.size,
          uploadedAt: lead.dprFile.uploadedAt || new Date().toISOString(),
          status: 'Verified',
          dataUrl: lead.dprFile.dataUrl,
          fileUrl: lead.dprFile.fileUrl,
          storageKey: lead.dprFile.storageKey
        });
      }
      if (lead.cmaFile) {
        initialDocs.push({
          id: 'cma-1',
          name: lead.cmaFile.name,
          type: 'Financial Model / CMA',
          size: lead.cmaFile.size,
          uploadedAt: lead.cmaFile.uploadedAt || new Date().toISOString(),
          status: 'Verified',
          dataUrl: lead.cmaFile.dataUrl,
          fileUrl: lead.cmaFile.fileUrl,
          storageKey: lead.cmaFile.storageKey
        });
      }
      if (lead.uploadedDocuments && Array.isArray(lead.uploadedDocuments)) {
        lead.uploadedDocuments.forEach(doc => {
          if (!initialDocs.some(d => d.name === doc.name)) {
            initialDocs.push(doc);
          }
        });
      }
      setDocuments(initialDocs);
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  // Auto calculate equity and percentages
  const costNum = parseFloat(String(formData.totalCostCr || 0));
  const loanNum = parseFloat(String(formData.loanRequiredCr || 0));
  const calcEquity = Math.max(0, costNum - loanNum);
  const debtPct = costNum > 0 ? Math.round((loanNum / costNum) * 100) : 75;
  const eqPct = 100 - debtPct;

  const handleCostChange = (val: string) => {
    const c = parseFloat(val) || 0;
    const l = parseFloat(String(formData.loanRequiredCr || 0)) || (c * 0.75);
    const e = Math.max(0, c - l);
    setFormData(prev => ({
      ...prev,
      totalCostCr: val,
      promoterContribCr: Math.round(e * 10) / 10
    }));
  };

  const handleLoanChange = (val: string) => {
    const l = parseFloat(val) || 0;
    const c = parseFloat(String(formData.totalCostCr || 0)) || (l / 0.75);
    const e = Math.max(0, c - l);
    setFormData(prev => ({
      ...prev,
      loanRequiredCr: val,
      promoterContribCr: Math.round(e * 10) / 10
    }));
  };

  const handleAddPromoter = () => {
    setPromoters(prev => [
      ...prev,
      {
        name: '',
        role: 'Director',
        shareholding: '',
        experience: '5',
        qualification: 'Graduate',
        dinOrPan: ''
      }
    ]);
  };

  const handleRemovePromoter = (index: number) => {
    setPromoters(prev => prev.filter((_, i) => i !== index));
  };

  const handlePromoterChange = (index: number, field: keyof PromoterDetail, value: string) => {
    setPromoters(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: newDocCategory,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'Verified',
        dataUrl: dataUrl
      };
      setDocuments(prev => [...prev, newDoc]);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneValidation = validateIndianMobileNumber(String(formData.mobile || ''));
    if (!phoneValidation.isValid) {
      alert(phoneValidation.error);
      return;
    }

    // Check if DPR/CMA are in documents
    const dprDoc = documents.find(d => d.type?.includes('DPR') || d.name.toLowerCase().includes('dpr'));
    const cmaDoc = documents.find(d => d.type?.includes('CMA') || d.name.toLowerCase().includes('cma'));

    const finalPayload: Partial<LeadRecord> = {
      ...formData,
      promotersList: promoters,
      uploadedDocuments: documents,
      promoterContribCr: formData.promoterContribCr || Math.round(calcEquity * 10) / 10,
      dprFile: dprDoc ? {
        name: dprDoc.name,
        size: typeof dprDoc.size === 'number' ? dprDoc.size : 1024 * 500,
        uploadedAt: dprDoc.uploadedAt || new Date().toISOString(),
        dataUrl: dprDoc.dataUrl,
        fileUrl: dprDoc.fileUrl
      } : (lead.dprFile || undefined),
      cmaFile: cmaDoc ? {
        name: cmaDoc.name,
        size: typeof cmaDoc.size === 'number' ? cmaDoc.size : 1024 * 300,
        uploadedAt: cmaDoc.uploadedAt || new Date().toISOString(),
        dataUrl: cmaDoc.dataUrl,
        fileUrl: cmaDoc.fileUrl
      } : (lead.cmaFile || undefined)
    };

    updateLeadRecord(lead.id, finalPayload, user.name || user.email);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-5 font-inter">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-900 text-base">Admin Project Editor</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Full Authority
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Editing: <strong className="text-zinc-800">{lead.projectName || 'Greenfield Project'}</strong> ({lead.fullName})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-zinc-200 bg-white flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Overview &amp; User Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'financials'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Financials &amp; Capex</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('promoters')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'promoters'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Promoters ({promoters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('land')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'land'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Land &amp; Collateral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Uploaded Files ({documents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Status &amp; Advisory Desk</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: OVERVIEW & USER INFO */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Applicant / User Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Promoter Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName || ''}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      value={formData.mobile || ''}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Project &amp; Industrial Classification</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      value={formData.projectName || ''}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Industry / Sector</label>
                    <input
                      type="text"
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Location / State</label>
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Gujarat, Maharashtra, Telangana"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Bankability Rating</label>
                    <select
                      value={formData.bankabilityRating || 'Investment Grade (A)'}
                      onChange={(e) => setFormData({ ...formData, bankabilityRating: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="Prime Bankable (AAA)">Prime Bankable (AAA)</option>
                      <option value="Highly Viable (AA)">Highly Viable (AA)</option>
                      <option value="Investment Grade (A)">Investment Grade (A)</option>
                      <option value="Moderate (BBB)">Moderate (BBB)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS & CAPEX */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs">Primary Capital Structure</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Total Project Cost (₹ Cr)</label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.totalCostCr || ''}
                        onChange={(e) => handleCostChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-zinc-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Term Loan Required (₹ Cr)</label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-blue-500 absolute left-2.5 top-2.5" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.loanRequiredCr || ''}
                        onChange={(e) => handleLoanChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-blue-700"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Promoter Equity (₹ Cr)</label>
                    <div className="relative">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 top-2.5" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.promoterContribCr || ''}
                        onChange={(e) => setFormData({ ...formData, promoterContribCr: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold text-emerald-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500">Debt to Equity Ratio: </span>
                    <strong className="text-blue-700 font-bold">{debtPct}% Debt : {eqPct}% Equity</strong>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Est. DSCR: <strong>1.48x</strong> | Benchmark ROI: <strong>8.75% p.a.</strong>
                  </div>
                </div>
              </div>

              {/* Detailed Cost of Project Components */}
              <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs">Cost Components Breakdown (Optional ₹ Cr)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-500 uppercase mb-1">Plant &amp; Machinery</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.financials?.machineryCostCr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, machineryCostCr: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 uppercase mb-1">Civil &amp; Factory Shed</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.financials?.civilCostCr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, civilCostCr: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 uppercase mb-1">Technical Consultancy</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.financials?.consultancyCostCr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, consultancyCostCr: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 uppercase mb-1">Contingencies / WC Margin</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.financials?.otherCostsCr || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        financials: { ...formData.financials, otherCostsCr: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROMOTERS & DIRECTORS */}
          {activeTab === 'promoters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 text-xs">Promoters &amp; Board of Directors</h4>
                  <p className="text-[11px] text-zinc-500">Manage all promoter profiles, equity shareholdings, and credentials.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPromoter}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Promoter</span>
                </button>
              </div>

              <div className="space-y-3">
                {promoters.map((p, idx) => (
                  <div key={idx} className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 text-xs">
                        {idx === 0 ? 'Lead Promoter' : `Co-Promoter ${idx}`}
                      </span>
                      {promoters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePromoter(idx)}
                          className="text-red-500 hover:text-red-700 p-1 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handlePromoterChange(idx, 'name', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg"
                          placeholder="e.g. Ramesh Chandra"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Role / Designation</label>
                        <input
                          type="text"
                          value={p.role || ''}
                          onChange={(e) => handlePromoterChange(idx, 'role', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg"
                          placeholder="e.g. Managing Director"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Shareholding (%)</label>
                        <input
                          type="number"
                          value={p.shareholding || ''}
                          onChange={(e) => handlePromoterChange(idx, 'shareholding', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg"
                          placeholder="e.g. 51"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Experience (Years)</label>
                        <input
                          type="number"
                          value={p.experience || ''}
                          onChange={(e) => handlePromoterChange(idx, 'experience', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg"
                          placeholder="e.g. 15"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">Qualification</label>
                        <input
                          type="text"
                          value={p.qualification || ''}
                          onChange={(e) => handlePromoterChange(idx, 'qualification', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg"
                          placeholder="e.g. B.Tech / MBA"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase mb-1">DIN / PAN (Optional)</label>
                        <input
                          type="text"
                          value={p.dinOrPan || ''}
                          onChange={(e) => handlePromoterChange(idx, 'dinOrPan', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg font-mono"
                          placeholder="DIN09823412"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LAND & COLLATERAL */}
          {activeTab === 'land' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs">Land Title &amp; Collateral Readiness</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Land Possession Status</label>
                    <select
                      value={formData.landStatus || 'Owned / Allotted'}
                      onChange={(e) => setFormData({ ...formData, landStatus: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="Owned / Allotted">Owned / Allotted (Clear Title)</option>
                      <option value="Industrial Estate Allotment">Industrial Estate Allotment (SIDC / GIDC / TSIIC)</option>
                      <option value="99-Year Long-Term Lease">99-Year Long-Term Industrial Lease</option>
                      <option value="Acquisition in Progress">Acquisition / Sale Deed in Progress</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Collateral Security Structure</label>
                    <input
                      type="text"
                      value={formData.collateralStatus || ''}
                      onChange={(e) => setFormData({ ...formData, collateralStatus: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Fixed Land, Factory Building & Commercial Assets"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Promoter Experience Summary</label>
                    <input
                      type="text"
                      value={formData.promoterExp || ''}
                      onChange={(e) => setFormData({ ...formData, promoterExp: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="e.g. 12+ Years Track Record in Steel & Heavy Fabrication"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-900 text-xs">Project Documents &amp; Compliance Dossier</h4>
                  <p className="text-[11px] text-zinc-500">Attach new dossiers, review uploads, or preview files.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    <option value="Detailed Project Report (DPR)">DPR Document</option>
                    <option value="Financial Model / CMA">CMA File</option>
                    <option value="Company KYC">Company KYC</option>
                    <option value="Promoter KYC">Promoter KYC</option>
                    <option value="Audited Balance Sheet">Audited Balance Sheet</option>
                    <option value="Land Title Document">Land Document</option>
                  </select>

                  <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-2">
                  <FileText className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-500 font-medium">No documents uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <strong className="text-zinc-900 text-xs truncate block">{doc.name}</strong>
                            <span className="text-[10px] text-zinc-500">{doc.type}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remove file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Encrypted 256-bit
                        </span>

                        <button
                          type="button"
                          onClick={() => setViewingDoc({
                            name: doc.name,
                            type: doc.type,
                            size: doc.size,
                            dataUrl: doc.dataUrl,
                            fileUrl: doc.fileUrl,
                            storageKey: doc.storageKey
                          })}
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STATUS & ADVISORY DESK */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <h4 className="font-bold text-zinc-900 text-xs">Advisory Workflow &amp; Assignment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Project Workflow Stage</label>
                    <select
                      value={formData.status || 'In Appraisal'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="New">New Inquiry</option>
                      <option value="Contacted">Promoter Contacted</option>
                      <option value="In Appraisal">In Financial Appraisal</option>
                      <option value="CA Approved">CA Desk Approved</option>
                      <option value="Bank Submitted">Submitted to Bank Consortium</option>
                      <option value="Sanctioned">Loan Sanctioned</option>
                      <option value="Disbursed">Funds Disbursed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Assigned Advisory Team</label>
                    <select
                      value={formData.assignedTeam || ''}
                      onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="CA Rajesh Sharma (FCA #847201)">CA Rajesh Sharma (FCA #847201)</option>
                      <option value="Priya Verma (Senior Financial Analyst)">Priya Verma (Senior Financial Analyst)</option>
                      <option value="Vikram Malhotra (Consortium Liaison)">Vikram Malhotra (Consortium Liaison)</option>
                      <option value="Advisory Desk & Debt Syndication Team">Advisory Desk &amp; Debt Syndication Team</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Internal Advisory Notes &amp; Next Steps</label>
                    <textarea
                      rows={3}
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Add appraisal notes, underwriting conditions, or communication summary..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-zinc-100 mt-4">
            <span className="text-[11px] text-zinc-400">
              Changes will be recorded in audit history and synced instantly.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 font-semibold text-xs rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Project Updates</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Embedded Document Viewer */}
      <DocumentViewerModal
        documentItem={viewingDoc}
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        projectName={formData.projectName || 'Greenfield Project'}
      />
    </div>
  );
};
