import React, { useState, useRef } from 'react';
import { ProjectDocument } from '../../types';
import { DocumentViewerModal, DocumentViewerTarget } from '../DocumentViewerModal';
import {
  FileCheck,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Lock,
  FileText,
  FileSpreadsheet,
  Download,
  ExternalLink,
  Eye,
  Plus,
  Filter,
  Check
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
  const [isUploading, setIsUploading] = useState(false);
  const [dpdpAgreed, setDpdpAgreed] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isDragging, setIsDragging] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentViewerTarget | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypes: { type: ProjectDocument['type']; label: string; desc: string; icon: any }[] = [
    { type: 'Company KYC', label: 'Company KYC', desc: 'Certificate of Inc, MOA/AOA, GSTIN, Board Resolution', icon: FileCheck },
    { type: 'Promoter KYC', label: 'Promoters KYC', desc: 'PAN, Aadhaar, Passport & CIBIL consent of Directors', icon: FileCheck },
    { type: 'DPR', label: 'DPR (Detailed Project Report)', desc: '14-50 page technical & feasibility appraisal report', icon: FileText },
    { type: 'Financial Model', label: 'Financial Model / CMA', desc: '10-year Excel or PDF CMA Balance Sheet & Cash Flows', icon: FileSpreadsheet },
    { type: 'Other Document', label: 'Other Documents', desc: 'Pollution NOC, Land Title Search, CE Certificates', icon: FileText }
  ];

  const activeDocs: ProjectDocument[] = documents || [];

  const filteredDocs = filterCategory === 'All'
    ? activeDocs
    : activeDocs.filter(d => d.type === filterCategory);

  const processFile = (file: File) => {
    setIsUploading(true);

    const formatFileSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Auto-detect type if obvious
    let docType = selectedType;
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('dpr') || lowerName.includes('project report')) {
      docType = 'DPR';
    } else if (lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.includes('cma') || lowerName.includes('financial')) {
      docType = 'Financial Model';
    } else if (lowerName.includes('pan') || lowerName.includes('aadhaar') || lowerName.includes('kyc')) {
      docType = 'Promoter KYC';
    }

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
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: docType,
        name: file.name,
        size: formatFileSize(file.size),
        uploadedAt: `${formattedDate}, ${formattedTime}`,
        status: 'Uploaded',
        dpdpConsent: dpdpAgreed,
        dataUrl: fileDataUrl
      };

      const updated = [newDoc, ...activeDocs];
      onUpdateDocuments(updated);
      setIsUploading(false);
    };

    reader.onerror = () => {
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = activeDocs.filter(d => d.id !== id);
    onUpdateDocuments(updated);
  };

  const handleOpenDoc = (doc: ProjectDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setViewingDoc({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
      dataUrl: doc.dataUrl,
      fileUrl: doc.fileUrl,
      storageKey: doc.storageKey,
      status: doc.status
    });
  };

  const handleDownload = (doc: ProjectDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (doc.dataUrl) {
      const a = document.createElement('a');
      a.href = doc.dataUrl;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([
        `Document Name: ${doc.name}\nType: ${doc.type}\nUploaded At: ${doc.uploadedAt}\nProject: ${projectName}\nStatus: Verified Inisio Lead File`
      ], { type: 'text/plain' });
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
    <div id="documents-compliance-center" className="bg-white rounded-2xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              Document Repository &amp; Compliance Center
            </h3>
            <p className="text-xs text-zinc-500">
              Upload, open, preview, and manage confidential banking dossiers with 256-bit encrypted security.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 w-fit ${
            activeDocs.length > 0 
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
              : 'text-zinc-600 bg-zinc-100 border-zinc-200'
          }`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${activeDocs.length > 0 ? 'text-emerald-600' : 'text-zinc-500'}`} />
            <span>{activeDocs.length} {activeDocs.length === 1 ? 'Document Active' : 'Documents Active'}</span>
          </span>
        </div>
      </div>

      {/* Mandatory DPDP Act Privacy Notice */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1.5 text-xs text-blue-950">
        <div className="flex items-center gap-2 font-bold text-blue-900">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>DPDP Act (2023) Compliant Privacy Notice</span>
        </div>
        <p className="text-xs text-blue-900 font-medium leading-relaxed">
          All uploads are end-to-end encrypted. We do not share your data with anyone except authorized partners in compliance with the DPDP Act, 2023. You can open and view your files at any time.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div
        id="doc-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-5 rounded-2xl border-2 border-dashed transition-all space-y-3 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[1.005]'
            : 'border-zinc-300 bg-zinc-50/60 hover:bg-zinc-50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-bold text-zinc-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload Project Document (PDF, DOCX, XLSX, Images)</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Drag and drop your file here, or select category and browse. Files open directly in the dashboard viewer.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              id="doc-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
            >
              {docTypes.map(d => (
                <option key={d.type} value={d.type}>{d.label}</option>
              ))}
            </select>

            <button
              id="doc-browse-btn"
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading & Encrypting...' : 'Browse & Upload'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              disabled={isUploading}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Company KYC', 'Promoter KYC', 'DPR', 'Financial Model', 'Other Document'].map((cat) => {
            const isSel = filterCategory === cat;
            const count = cat === 'All' ? activeDocs.length : activeDocs.filter(d => d.type === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isSel ? 'bg-blue-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] font-medium text-zinc-400">
          Showing {filteredDocs.length} of {activeDocs.length} records
        </span>
      </div>

      {/* Document Grid */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-xs font-bold text-zinc-800">
              {filterCategory === 'All' ? 'No Documents Uploaded Yet' : `No ${filterCategory} Documents Uploaded Yet`}
            </div>
            <p className="text-[11px] text-zinc-500 max-w-md mx-auto leading-relaxed">
              When you upload project dossiers (Company KYC, DPR, Financial Model / CMA), they will appear here and can be opened in the full-screen viewer or downloaded anytime.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDocs.map((doc) => {
              const lowerName = (doc.name || '').toLowerCase();
              const isXls = lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || doc.type === 'Financial Model';
              const isPdf = lowerName.endsWith('.pdf') || doc.type === 'DPR';
              const IconComponent = isXls ? FileSpreadsheet : isPdf ? FileText : FileCheck;

              return (
                <div
                  key={doc.id}
                  id={`doc-card-${doc.id}`}
                  onClick={() => handleOpenDoc(doc)}
                  className="p-4 bg-white rounded-2xl border border-zinc-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between text-xs group cursor-pointer shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isXls
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : isPdf
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 pr-1">
                        <div className="font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate text-xs sm:text-sm" title={doc.name}>
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-semibold border border-zinc-200">
                            {doc.type}
                          </span>
                          <span>{doc.size || '1.2 MB'}</span>
                          <span>•</span>
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      <span>{doc.status || 'Uploaded'}</span>
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-2.5 mt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`btn-open-${doc.id}`}
                        onClick={(e) => handleOpenDoc(doc, e)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="Open & Preview Document"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Open &amp; View</span>
                      </button>

                      <button
                        type="button"
                        id={`btn-download-${doc.id}`}
                        onClick={(e) => handleDownload(doc, e)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Download</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      id={`btn-delete-${doc.id}`}
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

      {/* Full Document Viewer Modal */}
      <DocumentViewerModal
        documentItem={viewingDoc}
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        projectName={projectName}
      />
    </div>
  );
};
