import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Check,
  User,
  Building
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  currentPhoto?: string;
  projectName?: string;
  userName?: string;
  onClose: () => void;
  onSave: (photoDataUrl: string | null) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  currentPhoto,
  projectName = 'Project',
  userName = 'User',
  onClose,
  onSave
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit.');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onSave(previewUrl);
    onClose();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName(null);
    setFileSize(null);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-inter animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-[430px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Upload Photo or Logo
              </h2>
              <p className="text-xs text-slate-400">
                Personal profile photo or project company logo
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

        {/* Dropzone / Upload Area */}
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
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/40'
                : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 mb-2.5 hover:bg-slate-50 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Choose Image</span>
            </div>

            <p className="text-xs font-semibold text-slate-800">
              Choose a photo or drag &amp; drop it here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, WebP or SVG up to 10 MB
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-5 mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Live Preview Display */}
        {previewUrl ? (
          <div className="px-5 pb-3">
            <div className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Live Previews
              </div>
              <div className="flex items-center justify-around gap-4 py-1">
                {/* Square Logo Preview */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center p-1">
                    <img
                      src={previewUrl}
                      alt="Project Logo Preview"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <Building className="w-3 h-3 text-slate-400" />
                    Project Logo
                  </span>
                </div>

                {/* Round Avatar Preview */}
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-xs overflow-hidden flex items-center justify-center p-0.5">
                    <img
                      src={previewUrl}
                      alt="User Avatar Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    User Avatar
                  </span>
                </div>
              </div>

              {/* Status row */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready to apply {fileSize ? `(${formatFileSize(fileSize)})` : ''}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-slate-400 hover:text-red-600 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-xs text-slate-500">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                {projectName ? projectName.charAt(0).toUpperCase() : 'IN'}
              </div>
              <p className="text-[11px] leading-relaxed">
                Currently displaying default project initials. Upload a photo or corporate logo to customize your dashboard and reports.
              </p>
            </div>
          </div>
        )}

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
            <span>Save &amp; Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
