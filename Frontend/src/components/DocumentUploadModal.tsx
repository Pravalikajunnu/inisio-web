import React, { useState, useRef } from 'react';
import { UserProjectDetail } from './UserDashboard';
import {
  X,
  FileText,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Trash2,
  Check,
  Loader2
} from 'lucide-react';

interface DocumentUploadModalProps {
  project: UserProjectDetail;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: {
    dprFile?: { name: string; size: number; uploadedAt: string } | null;
    cmaFile?: { name: string; size: number; uploadedAt: string } | null;
  }) => void;
}

type DocCategory = 'dpr' | 'cma';

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  project,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeCategory, setActiveCategory] = useState<DocCategory>('dpr');
  const [dprFile, setDprFile] = useState<{ name: string; size: number; uploadedAt: string } | null>(
    project.dprFile || null
  );
  const [cmaFile, setCmaFile] = useState<{ name: string; size: number; uploadedAt: string } | null>(
    project.cmaFile || null
  );

  const [uploadingProgress, setUploadingProgress] = useState<{
    type: DocCategory;
    progress: number;
    name: string;
    size: number;
  } | null>(null);

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
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
              uploadedAt: new Date().toISOString()
            });
          } else {
            setCmaFile({
              name: file.name,
              size: file.size,
              uploadedAt: new Date().toISOString()
            });
          }
          setUploadingProgress(null);
        }, 300);
      } else {
        setUploadingProgress((prev) => prev ? { ...prev, progress: currentProg } : null);
      }
    }, 180);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    handleProcessFile(files[0]);
  };

  const handleSave = () => {
    onSave({
      dprFile: dprFile,
      cmaFile: cmaFile
    });
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-inter animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[430px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching image design */}
        <div className="p-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upload files
              </h2>
              <p className="text-xs text-slate-400">
                Select and upload the files of your choice
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

        {/* Document Type Selector Pills */}
        <div className="px-5 pt-1 pb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('dpr')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeCategory === 'dpr'
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs'
                : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>DPR Report</span>
            {dprFile && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('cma')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeCategory === 'cma'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-2xs'
                : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>CMA Model</span>
            {cmaFile && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>
        </div>

        {/* Dropzone Area (Matching Image) */}
        <div className="px-5 pb-3">
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
            className={`border border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/40'
                : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={activeCategory === 'dpr' ? '.pdf,.doc,.docx' : '.xlsx,.xls,.pdf'}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 mb-3 hover:bg-slate-50 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Upload</span>
            </div>

            <p className="text-xs font-semibold text-slate-800">
              Choose a file or drag &amp; drop it here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Maximum 500 MB file size ({activeCategory === 'dpr' ? 'PDF, DOC, DOCX' : 'XLSX, XLS, PDF'})
            </p>
          </div>
        </div>

        {/* Uploaded / Progress Files List (Matching Image) */}
        <div className="px-5 py-2 space-y-2.5 max-h-[220px] overflow-y-auto">
          {/* Active Uploading Progress File */}
          {uploadingProgress && (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 text-[10px] font-bold">
                    {uploadingProgress.type === 'cma' ? 'XLS' : 'PDF'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {uploadingProgress.name}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>{formatFileSize(uploadingProgress.size * (uploadingProgress.progress / 100))}</span>
                      <span>/</span>
                      <span>{formatFileSize(uploadingProgress.size)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Uploading...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-slate-600">
                    {uploadingProgress.progress}%
                  </span>
                  <button
                    onClick={() => setUploadingProgress(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar with smooth blue-purple gradient */}
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
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {dprFile.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{formatFileSize(dprFile.size)} / {formatFileSize(dprFile.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDprFile(null)}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                title="Remove DPR"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* CMA Completed File */}
          {cmaFile && (
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-[10px] font-bold">
                  XLS
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {cmaFile.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>{formatFileSize(cmaFile.size)} / {formatFileSize(cmaFile.size)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-100" />
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCmaFile(null)}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                title="Remove CMA"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
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
    </div>
  );
};
