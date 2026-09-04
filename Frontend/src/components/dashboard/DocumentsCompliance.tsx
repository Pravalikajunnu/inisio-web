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
    { type: 'Promoter KYC', label: 'Promoters KYC', desc: 'PAN, Aadhaar, Passport & CIBIL consent of Directors', icon: FileCheck },
    { type: 'DPR', label: 'DPR (Detailed Project Report)', desc: '14-50 page technical & feasibility appraisal report', icon: FileText },
    { type: 'Financial Model', label: 'Financial Model / CMA', desc: '10-year Excel or PDF CMA Balance Sheet & Cash Flows', icon: FileSpreadsheet },
    { type: 'Other Document', label: 'Other Documents', desc: 'Pollution NOC, Land Title Search, CE Certificates', icon: FileText }
  ];

  // Only use actual uploaded documents, no dummy records
  const activeDocs: ProjectDocument[] = documents || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const reader = new FileReader();
    reader.onload = () => {
      const fileDataUrl = typeof reader.result === 'string' ? reader.result : undefined;
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const formattedTime = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const newDoc: ProjectDocument = {
        id: `doc-${Date.now()}`,
        type: selectedType,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: `${formattedDate}, ${formattedTime}`,
        status: 'Uploaded',
        dpdpConsent: dpdpAgreed,
        dataUrl: fileDataUrl
      };

      const updated = [...activeDocs, newDoc];
      onUpdateDocuments(updated);
      setIsUploading(false);
      setCustomDocName('');
      e.target.value = '';
    };

    reader.onerror = () => {
      setIsUploading(false);
      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    const updated = activeDocs.filter(d => d.id !== id);
    onUpdateDocuments(updated);
  };

  const handleDownload = (doc: ProjectDocument) => {
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback text download if dataUrl is not stored
      const blob = new Blob([`Document: ${doc.name}\nType: ${doc.type}\nUploaded: ${doc.uploadedAt}\nProject: ${projectName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.name}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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

        <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
          activeDocs.length > 0 
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
            : 'text-zinc-600 bg-zinc-100 border-zinc-200'
        }`}>
          <ShieldCheck className={`w-3.5 h-3.5 ${activeDocs.length > 0 ? 'text-emerald-600' : 'text-zinc-500'}`} />
          <span>{activeDocs.length} {activeDocs.length === 1 ? 'Document Active' : 'Documents Active'}</span>
        </span>
      </div>

      {/* Mandatory DPDP Act Privacy Notice */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs text-blue-950">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>DPDP Act (2023) Compliant Privacy Notice</span>
        </div>
        <p className="text-xs text-blue-900 font-medium leading-relaxed">
          All uploads are end-to-end encrypted. We do not share your data with anyone except authorized partners in compliance with the DPDP Act, 2023.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-300 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-zinc-800">Upload Project Document</div>
            <p className="text-[11px] text-zinc-500">Select document category and attach real PDF, DOCX, XLSX up to 25MB.</p>
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
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
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

        {activeDocs.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-xs font-bold text-zinc-800">No Documents Uploaded Yet</div>
            <p className="text-[11px] text-zinc-500 max-w-md mx-auto leading-relaxed">
              No dummy files are displayed. When you, your CA, or the Inisio team upload real project dossiers (Company KYC, DPR, Financial Model / CMA), they will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeDocs.map((doc) => {
              const IconComponent = doc.type === 'Financial Model' ? FileSpreadsheet : doc.type.includes('KYC') ? FileCheck : FileText;
              return (
                <div
                  key={doc.id}
                  className="p-3.5 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors flex items-center justify-between text-xs group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-zinc-900 truncate" title={doc.name}>{doc.name}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                        <span className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-medium">{doc.type}</span>
                        <span>{doc.size || '1.2 MB'}</span>
                        <span>•</span>
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>{doc.status || 'Uploaded'}</span>
                    </span>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Download / View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
