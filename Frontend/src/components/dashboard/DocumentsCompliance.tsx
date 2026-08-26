import React, { useState } from 'react';
import { ProjectDocument } from '../../types';
import {
  FileCheck,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Lock,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';

interface DocumentsComplianceProps {
  documents: ProjectDocument[];
  onUpdateDocuments: (docs: ProjectDocument[]) => void;
  projectName?: string;
}

export const DocumentsCompliance: React.FC<DocumentsComplianceProps> = ({
  documents,
  onUpdateDocuments,
  projectName = 'Greenfield Project'
}) => {
  const [selectedType, setSelectedType] = useState<ProjectDocument['type']>('Company KYC');
  const [customDocName, setCustomDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dpdpAgreed, setDpdpAgreed] = useState(true);

  const docTypes: { type: ProjectDocument['type']; label: string; desc: string; icon: any }[] = [
    { type: 'Company KYC', label: 'Company KYC', desc: 'Certificate of Inc, MOA/AOA, GSTIN, Board Resolution', icon: FileCheck },
    { type: 'Promoter KYC', label: 'Promoter KYC', desc: 'PAN, Aadhaar, Passport & CIBIL consent of Directors', icon: FileCheck },
    { type: 'DPR', label: 'Detailed Project Report (DPR)', desc: '14-50 page technical & feasibility appraisal report', icon: FileText },
    { type: 'Financial Model', label: 'Financial Model / CMA', desc: '10-year Excel or PDF CMA Balance Sheet & Cash Flows', icon: FileSpreadsheet },
    { type: 'Other Document', label: 'Other Statutory Clearances', desc: 'Pollution NOC, Land Title Search, CE Certificates', icon: FileText }
  ];

  // Default documents if none exist
  const activeDocs: ProjectDocument[] = documents && documents.length > 0 ? documents : [
    {
      id: 'doc-1',
      type: 'Company KYC',
      name: 'Certificate_of_Incorporation_CIN.pdf',
      size: '1.4 MB',
      uploadedAt: 'Yesterday',
      status: 'Verified',
      dpdpConsent: true
    },
    {
      id: 'doc-2',
      type: 'Financial Model',
      name: '10_Year_CMA_CashFlow_Model.xlsx',
      size: '2.8 MB',
      uploadedAt: 'Today',
      status: 'Verified',
      dpdpConsent: true
    }
  ];

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        type: selectedType,
        name: customDocName.trim() ? `${customDocName}.pdf` : file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Uploaded',
        dpdpConsent: dpdpAgreed
      };

      const updated = [...activeDocs, newDoc];
      onUpdateDocuments(updated);
      setIsUploading(false);
      setCustomDocName('');
      e.target.value = '';
    }, 600);
  };

  const handleDelete = (id: string) => {
    const updated = activeDocs.filter(d => d.id !== id);
    onUpdateDocuments(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Document Repository &amp; Compliance Center
            </h3>
            <p className="text-xs text-zinc-500">
              Upload and manage confidential project files with end-to-end encrypted security.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 w-fit">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{activeDocs.length} Documents Active</span>
        </span>
      </div>

      {/* Mandatory DPDP Act Notice */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs text-blue-950">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>DPDP Act (2023) Compliant Data Privacy &amp; End-to-End Encryption</span>
        </div>
        <p className="text-[11px] text-blue-800 leading-relaxed font-normal">
          Protected by 256-bit end-to-end encryption. Your confidential corporate and personal data is strictly safeguarded under the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and never shared with unauthorized parties except designated accredited institutional partners upon your explicit consent.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-300 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-800">Upload Project Document</div>
            <p className="text-[11px] text-zinc-500">Select document category and attach PDF, DOCX, XLSX up to 25MB.</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-800 outline-none"
            >
              {docTypes.map(d => (
                <option key={d.type} value={d.type}>{d.label}</option>
              ))}
            </select>

            <label className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Browse & Upload'}</span>
              <input
                type="file"
                disabled={isUploading}
                onChange={handleSimulatedUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
          Uploaded Project Records ({activeDocs.length})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors flex items-center justify-between text-xs group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-zinc-900 truncate">{doc.name}</div>
                  <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-medium">{doc.type}</span>
                    <span>{doc.size || '1.2 MB'}</span>
                    <span>•</span>
                    <span>{doc.uploadedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{doc.status || 'Verified'}</span>
                </span>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 text-zinc-300 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
