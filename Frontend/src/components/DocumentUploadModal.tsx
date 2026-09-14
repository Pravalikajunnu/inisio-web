import React, { useState, useRef } from 'react';
import { UserProjectDetail } from './UserDashboard';
import { ProjectDocument } from '../types';
import { DocumentViewerModal, DocumentViewerTarget } from './DocumentViewerModal';
import { storeDocumentData } from '../utils/documentStorage';
import api from '../utils/apiClient';
import {
  X,
  FileText,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Trash2,
  Check,
  Eye,
  Lock,
  ExternalLink
} from 'lucide-react';

interface DocumentUploadModalProps {
  project: UserProjectDetail;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    dprFile?: { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string; storageKey?: string } | null;
    cmaFile?: { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string; storageKey?: string } | null;
    uploadedDocuments?: ProjectDocument[];
  }) => void;
}

type DocCategory = 'dpr' | 'cma';
type UploadFile = { name: string; size: number; uploadedAt: string; dataUrl?: string; fileUrl?: string; storageKey?: string };

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeCategory, setActiveCategory] = useState<DocCategory>('dpr');
  const [dprFile, setDprFile] = useState<UploadFile | null>(
    project.dprFile || null
  );
  const [cmaFile, setCmaFile] = useState<UploadFile | null>(
    project.cmaFile || null
  );

  const [uploadingProgress, setUploadingProgress] = useState<{
    type: DocCategory;
    progress: number;
    name: string;
    size: number;
  } | null>(null);

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentViewerTarget | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = (file: File) => {
    const isCma = activeCategory === 'cma' || file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx');
    const targetType: DocCategory = isCma ? 'cma' : activeCategory;

    // Simulate smooth upload progress
    setUploadingProgress({
      type: targetType,
      progress: 25,
      name: file.name,
      size: file.size
    });

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrlResult = typeof reader.result === 'string' ? reader.result : undefined;
      let currentProg = 25;
      const interval = setInterval(() => {
        currentProg += 25;
        if (currentProg >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (targetType === 'dpr') {
              setDprFile({
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                dataUrl: dataUrlResult
              });
            } else {
              setCmaFile({
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                dataUrl: dataUrlResult
              });
            }
            setUploadingProgress(null);
          }, 200);
        } else {
          setUploadingProgress((prev) => prev ? { ...prev, progress: currentProg } : null);
        }
      }, 150);
    };

    reader.onerror = () => {
      setUploadingProgress(null);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    handleProcessFile(files[0]);
  };

  const handleSave = async () => {
    const persistFile = async (file: UploadFile | null, category: DocCategory) => {
      if (!file?.dataUrl) return file;
      if (project.id) {
        const uploaded = await fetch(file.dataUrl).then(response => response.blob()).then(blob =>
          api.documents.upload(project.id, category === 'dpr' ? 'DPR' : 'Financial Model', new File([blob], file.name, { type: blob.type }))
        );
        return {
          ...file,
          dataUrl: undefined,
          storageKey: uploaded.storageName,
          fileUrl: api.documents.downloadUrl(uploaded._id)
        };
      }
      const storageKey = file.storageKey || `project-${project.id}-${category}`;
      await storeDocumentData(file.dataUrl, storageKey);
      return { ...file, storageKey };
    };

    const persistedDprFile = await persistFile(dprFile, 'dpr');
    const persistedCmaFile = await persistFile(cmaFile, 'cma');

    // Build synchronized uploadedDocuments array
    let updatedDocs: ProjectDocument[] = [...(project.uploadedDocuments || [])];

    if (persistedDprFile) {
      const existingDprIndex = updatedDocs.findIndex(d => d.type === 'DPR' || d.name === persistedDprFile.name);
      const newDprDoc: ProjectDocument = {
        id: existingDprIndex >= 0 ? updatedDocs[existingDprIndex].id : `doc-dpr-${Date.now()}`,
        type: 'DPR',
        name: persistedDprFile.name,
        size: formatFileSize(persistedDprFile.size),
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Uploaded',
        dpdpConsent: true,
        dataUrl: persistedDprFile.dataUrl,
        storageKey: persistedDprFile.storageKey
      };
      if (existingDprIndex >= 0) {
        updatedDocs[existingDprIndex] = newDprDoc;
      } else {
        updatedDocs.unshift(newDprDoc);
      }
    }

    if (persistedCmaFile) {
      const existingCmaIndex = updatedDocs.findIndex(d => d.type === 'Financial Model' || d.name === persistedCmaFile.name);
      const newCmaDoc: ProjectDocument = {
        id: existingCmaIndex >= 0 ? updatedDocs[existingCmaIndex].id : `doc-cma-${Date.now()}`,
        type: 'Financial Model',
        name: persistedCmaFile.name,
        size: formatFileSize(persistedCmaFile.size),
        uploadedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Uploaded',
        dpdpConsent: true,
        dataUrl: persistedCmaFile.dataUrl,
        storageKey: persistedCmaFile.storageKey
      };
      if (existingCmaIndex >= 0) {
        updatedDocs[existingCmaIndex] = newCmaDoc;
      } else {
        updatedDocs.unshift(newCmaDoc);
      }
    }

    onSave({
      dprFile: persistedDprFile,
      cmaFile: persistedCmaFile,
      uploadedDocuments: updatedDocs
    });
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleOpenPreview = (file: { name: string; size: number; uploadedAt: string; dataUrl?: string }, type: string) => {
    setViewingDoc({
      name: file.name,
      size: file.size,
      type: type,
      uploadedAt: file.uploadedAt,
      dataUrl: file.dataUrl,
      storageKey: file.storageKey,
      status: 'Uploaded'
    });
  };

  return (
    <div
      id="document-upload-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-inter animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="document-upload-modal-content"
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[460px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upload &amp; Manage Files
              </h2>
              <p className="text-xs text-slate-400">
                Attach and preview DPR and CMA dossiers for {project.projectName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DPDP Notice */}
        <div className="mx-5 mb-2 p-2.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center gap-2 text-[11px] text-blue-900">
          <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>DPDP Act (2023) Encrypted. Accessible anytime in your dashboard.</span>
        </div>

        {/* Document Type Selector Pills */}
        <div className="px-5 pt-1">
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveCategory('dpr')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeCategory === 'dpr'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>DPR Report</span>
              {dprFile && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('cma')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeCategory === 'cma'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CMA Financials</span>
              {cmaFile && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="p-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Upload className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-800">
                Choose a file or drag &amp; drop it here
              </p>
              <p className="text-[11px] text-slate-400">
                {activeCategory === 'dpr'
                  ? 'PDF, DOCX, DOC up to 50MB'
                  : 'XLSX, XLS, CSV, PDF up to 50MB'}
              </p>
            </div>

            <button
              type="button"
              className="mt-1 px-4 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            >
              Browse File
            </button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={
                activeCategory === 'dpr'
                  ? '.pdf,.doc,.docx,.xls,.xlsx'
                  : '.xls,.xlsx,.csv,.pdf'
              }
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Upload Progress */}
          {uploadingProgress && (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-900 truncate">
                    {uploadingProgress.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-600">
                  {uploadingProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${uploadingProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* DPR Completed File */}
          {dprFile && (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 text-[10px] font-bold">
                  DPR
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate" title={dprFile.name}>
                    {dprFile.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{formatFileSize(dprFile.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                      Uploaded
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(dprFile, 'DPR')}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Open DPR file in viewer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Open</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDprFile(null)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Remove DPR"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* CMA Completed File */}
          {cmaFile && (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 text-[10px] font-bold">
                  CMA
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate" title={cmaFile.name}>
                    {cmaFile.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{formatFileSize(cmaFile.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                      Uploaded
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(cmaFile, 'Financial Model')}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Open CMA file in viewer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Open</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCmaFile(null)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Remove CMA"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save &amp; Continue</span>
          </button>
        </div>
      </div>

      {/* In-Modal Document Viewer */}
      <DocumentViewerModal
        documentItem={viewingDoc}
        isOpen={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        projectName={project.projectName}
      />
    </div>
  );
};
