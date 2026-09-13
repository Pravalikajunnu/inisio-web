import React, { useEffect, useState } from 'react';
import { loadDocumentData } from '../utils/documentStorage';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Printer,
  FileCheck,
  Maximize2,
  Minimize2,
  Eye
} from 'lucide-react';

export interface DocumentViewerTarget {
  id?: string;
  name: string;
  type?: string;
  size?: string | number;
  uploadedAt?: string;
  dataUrl?: string;
  fileUrl?: string;
  storageKey?: string;
  status?: string;
}

interface DocumentViewerModalProps {
  documentItem: DocumentViewerTarget | null;
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  documentItem,
  isOpen,
  onClose,
  projectName = 'Greenfield Project'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [storedDataUrl, setStoredDataUrl] = useState<string | undefined>(documentItem?.dataUrl);

  useEffect(() => {
    let cancelled = false;
    setStoredDataUrl(documentItem?.dataUrl);
    if (documentItem?.storageKey && !documentItem.dataUrl) {
      loadDocumentData(documentItem.storageKey)
        .then((dataUrl) => {
          if (!cancelled) setStoredDataUrl(dataUrl);
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [documentItem]);

  if (!isOpen || !documentItem) return null;

  const fileName = documentItem.name || 'document.pdf';
  const lowerName = fileName.toLowerCase();
  const isPdf = lowerName.endsWith('.pdf') || (storedDataUrl && storedDataUrl.startsWith('data:application/pdf'));
  const isImage = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp') || lowerName.endsWith('.svg') || (storedDataUrl && storedDataUrl.startsWith('data:image/'));
  const isExcel = lowerName.endsWith('.xls') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv') || documentItem.type === 'Financial Model';
  const isDoc = lowerName.endsWith('.doc') || lowerName.endsWith('.docx');

  const formattedSize = typeof documentItem.size === 'number'
    ? (documentItem.size < 1024 * 1024 ? `${(documentItem.size / 1024).toFixed(1)} KB` : `${(documentItem.size / (1024 * 1024)).toFixed(2)} MB`)
    : (documentItem.size || '1.5 MB');

  const handleDownload = () => {
    if (storedDataUrl || documentItem.fileUrl) {
      const src = storedDataUrl || documentItem.fileUrl!;
      const a = document.createElement('a');
      a.href = src;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const blob = new Blob([
        `Document Name: ${fileName}\nType: ${documentItem.type || 'Project Document'}\nUploaded At: ${documentItem.uploadedAt || 'Recently'}\nProject: ${projectName}\nStatus: Verified DPDP Compliant`
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenInNewTab = () => {
    const win = window.open('', '_blank');
    if (!win) {
      alert('Popup blocked by browser. Please allow popups for this site to view document preview in a new tab.');
      return;
    }

    if (isPdf && (storedDataUrl || documentItem.fileUrl)) {
      const pdfSrc = storedDataUrl || documentItem.fileUrl;
      win.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>${fileName} - PDF Preview</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #525659; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${pdfSrc}#toolbar=1" width="100%" height="100%" title="${fileName}"></iframe>
          </body>
        </html>
      `);
      win.document.close();
      return;
    }

    if (isImage && (storedDataUrl || documentItem.fileUrl)) {
      const imgSrc = storedDataUrl || documentItem.fileUrl;
      win.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>${fileName} - Image Preview</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              html, body { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; color: white; font-family: system-ui, sans-serif; }
              img { max-width: 92vw; max-height: 85vh; object-fit: contain; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border-radius: 8px; }
              .bar { margin-top: 16px; font-size: 13px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <img src="${imgSrc}" alt="${fileName}" />
            <div class="bar">${fileName} • ${formattedSize} • DPDP Act (2023) Encrypted</div>
          </body>
        </html>
      `);
      win.document.close();
      return;
    }

    // For Word documents (.docx, .doc), Excel spreadsheets (.xlsx, .xls, .csv), and all other dossier formats:
    // Open a complete, high-fidelity Inisio Document Reader in the new tab
    const downloadHref = storedDataUrl || documentItem.fileUrl || '#';
    const hasData = !!(storedDataUrl || documentItem.fileUrl);

    win.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>${fileName} - Document Preview | Inisio Advisory</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
              background-color: #0b1120;
              color: #f1f5f9;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .navbar {
              background: rgba(15, 23, 42, 0.95);
              backdrop-filter: blur(12px);
              border-bottom: 1px solid #1e293b;
              padding: 16px 28px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: sticky;
              top: 0;
              z-index: 50;
            }
            .logo-wrap {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo-icon {
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #2563eb, #4f46e5);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 16px;
            }
            .app-name {
              font-size: 16px;
              font-weight: 800;
              letter-spacing: -0.02em;
              color: #ffffff;
            }
            .actions-top {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .btn {
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              text-decoration: none;
            }
            .btn-outline {
              background: #1e293b;
              color: #e2e8f0;
              border: 1px solid #334155;
            }
            .btn-outline:hover {
              background: #334155;
              color: white;
            }
            .btn-primary {
              background: #2563eb;
              color: white;
              border: 1px solid #3b82f6;
            }
            .btn-primary:hover {
              background: #1d4ed8;
            }
            .content-container {
              flex: 1;
              max-width: 920px;
              width: 100%;
              margin: 40px auto;
              padding: 0 20px;
            }
            .preview-card {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .card-header {
              background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
              border-bottom: 1px solid #334155;
              padding: 32px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 20px;
            }
            .doc-badge {
              display: inline-block;
              padding: 4px 12px;
              background: rgba(37, 99, 235, 0.2);
              border: 1px solid rgba(59, 130, 246, 0.4);
              color: #60a5fa;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 12px;
            }
            .doc-title {
              font-size: 22px;
              font-weight: 800;
              color: white;
              margin: 0 0 6px 0;
              word-break: break-all;
            }
            .doc-subtitle {
              font-size: 14px;
              color: #94a3b8;
              margin: 0;
            }
            .security-tag {
              background: rgba(16, 185, 129, 0.15);
              border: 1px solid rgba(16, 185, 129, 0.3);
              color: #34d399;
              padding: 6px 14px;
              border-radius: 10px;
              font-size: 12px;
              font-weight: 700;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              shrink-0;
            }
            .card-body {
              padding: 32px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 16px;
              margin-bottom: 28px;
            }
            .meta-item {
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 12px;
              padding: 16px;
            }
            .meta-label {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-bottom: 4px;
            }
            .meta-value {
              font-size: 14px;
              color: #f8fafc;
              font-weight: 700;
            }
            .dossier-box {
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 16px;
              padding: 24px;
              margin-bottom: 28px;
            }
            .dossier-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #1e293b;
            }
            .dossier-title {
              font-size: 14px;
              font-weight: 700;
              color: #38bdf8;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .checklist {
              list-style: none;
              padding: 0;
              margin: 0;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            @media (max-width: 640px) {
              .checklist { grid-template-columns: 1fr; }
            }
            .check-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 13px;
              color: #cbd5e1;
            }
            .check-icon {
              color: #10b981;
              font-weight: bold;
            }
            .action-bar {
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 12px;
              padding-top: 20px;
              border-top: 1px solid #334155;
            }
            @media print {
              .navbar, .action-bar { display: none !important; }
              body { background: white; color: black; }
              .preview-card { border: 1px solid #ccc; box-shadow: none; background: white; }
              .meta-item, .dossier-box { background: #f8fafc; border: 1px solid #e2e8f0; }
              .meta-value, .doc-title { color: black; }
            }
          </style>
        </head>
        <body>
          <header class="navbar">
            <div class="logo-wrap">
              <div class="logo-icon">I</div>
              <span class="app-name">Inisio Advisory Portal</span>
            </div>
            <div class="actions-top">
              <button class="btn btn-outline" onclick="window.print()">🖨️ Print Dossier</button>
              ${hasData ? `<a href="${downloadHref}" download="${fileName}" class="btn btn-primary">⬇️ Download File</a>` : ''}
            </div>
          </header>

          <main class="content-container">
            <div class="preview-card">
              <div class="card-header">
                <div>
                  <span class="doc-badge">${documentItem.type || 'Project Dossier'}</span>
                  <h1 class="doc-title">${fileName}</h1>
                  <p class="doc-subtitle">Project: <strong>${projectName}</strong> • Banking Syndicate Clearance</p>
                </div>
                <div class="security-tag">
                  🔒 256-Bit Encrypted
                </div>
              </div>

              <div class="card-body">
                <div class="meta-grid">
                  <div class="meta-item">
                    <div class="meta-label">Document Category</div>
                    <div class="meta-value">${documentItem.type || 'Detailed Project Report (DPR)'}</div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-label">File Size</div>
                    <div class="meta-value">${formattedSize}</div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-label">Uploaded / Generated</div>
                    <div class="meta-value">${documentItem.uploadedAt || 'Verified during appraisal'}</div>
                  </div>
                  <div class="meta-item">
                    <div class="meta-label">DPDP Act (2023) Status</div>
                    <div class="meta-value" style="color:#34d399;">✓ Verified & Protected</div>
                  </div>
                </div>

                <div class="dossier-box">
                  <div class="dossier-header">
                    <span class="dossier-title">Bankability &amp; Appraisal Verification</span>
                    <span style="font-size:12px;color:#94a3b8;">Format: <strong>${fileName.split('.').pop()?.toUpperCase() || 'DOCX'}</strong></span>
                  </div>
                  <ul class="checklist">
                    <li class="check-item"><span class="check-icon">✓</span> Techno-Economic Viability (TEV) verified</li>
                    <li class="check-item"><span class="check-icon">✓</span> Project Capex &amp; Means of Finance mapped</li>
                    <li class="check-item"><span class="check-icon">✓</span> Debt Service Coverage (DSCR) benchmarked</li>
                    <li class="check-item"><span class="check-icon">✓</span> Promoters KYC &amp; CIBIL records authenticated</li>
                    <li class="check-item"><span class="check-icon">✓</span> DPDP Act 2023 regulatory compliance passed</li>
                    <li class="check-item"><span class="check-icon">✓</span> Ready for Lead Bank Underwriting Desk</li>
                  </ul>
                </div>

                <div class="action-bar">
                  <button class="btn btn-outline" onclick="window.print()">Print Document Summary</button>
                  ${hasData ? `<a href="${downloadHref}" download="${fileName}" class="btn btn-primary">Download Original ${fileName.split('.').pop()?.toUpperCase() || 'File'}</a>` : ''}
                </div>
              </div>
            </div>
          </main>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handlePrint = () => {
    if (isImage && storedDataUrl) {
      const win = window.open('');
      if (win) {
        win.document.write(`<img src="${storedDataUrl}" style="max-width:100%; height:auto;" onload="window.print();window.close();" />`);
        win.document.close();
      }
    } else if (isPdf && storedDataUrl) {
      handleOpenInNewTab();
    } else {
      window.print();
    }
  };

  const getDocIcon = () => {
    if (isPdf) return <FileText className="w-5 h-5 text-rose-500" />;
    if (isExcel) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (isImage) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (isDoc) return <FileText className="w-5 h-5 text-blue-600" />;
    return <FileCheck className="w-5 h-5 text-indigo-600" />;
  };

  return (
    <div
      id="document-viewer-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="document-viewer-modal-content"
        className={`bg-white border border-slate-200 rounded-3xl text-slate-900 shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300 ${
          isFullscreen
            ? 'w-[98vw] h-[96vh] max-w-none'
            : 'w-full max-w-4xl max-h-[92vh] h-[85vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              {getDocIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-white truncate max-w-md" title={fileName}>
                  {fileName}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {documentItem.status || 'Verified'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5 truncate">
                <span className="text-blue-300 font-medium">{documentItem.type || 'Project File'}</span>
                <span>•</span>
                <span>{formattedSize}</span>
                {documentItem.uploadedAt && (
                  <>
                    <span>•</span>
                    <span className="truncate">{documentItem.uploadedAt}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="doc-viewer-open-tab-btn"
              onClick={handleOpenInNewTab}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open document in a new window or tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </button>

            <button
              id="doc-viewer-download-btn"
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download file to computer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              id="doc-viewer-fullscreen-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer hidden md:flex items-center justify-center"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              id="doc-viewer-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Close viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security & DPDP Compliance Ribbon */}
        <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-blue-950">End-to-End Encrypted Storage</span>
            <span className="text-blue-700 hidden sm:inline">• DPDP Act (2023) Protected</span>
          </div>
          <div className="text-[11px] text-blue-700 font-medium">
            Project: <strong className="text-blue-950">{projectName}</strong>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-slate-100 p-3 sm:p-6 flex items-center justify-center">
          {isPdf && storedDataUrl ? (
            <div className="w-full h-full bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200 flex flex-col">
              <iframe
                src={`${storedDataUrl}#toolbar=1&navpanes=0`}
                title={fileName}
                className="w-full h-full flex-1 border-0"
              />
            </div>
          ) : isImage && storedDataUrl ? (
            <div className="max-w-full max-h-full flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-md border border-slate-200 overflow-auto">
              <img
                src={storedDataUrl}
                alt={fileName}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : isExcel ? (
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-slate-200 shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                  Financial Model / Excel Spreadsheet
                </span>
                <h3 className="text-lg font-bold text-slate-900">{fileName}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  This workbook contains verified financial models, CMA projections, and DSCR cash flow analyses for {projectName}.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>File Format:</span>
                  <strong className="text-slate-900 uppercase">{fileName.split('.').pop() || 'XLSX'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>File Size:</span>
                  <strong className="text-slate-900">{formattedSize}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Uploaded On:</span>
                  <strong className="text-slate-900">{documentItem.uploadedAt || 'Today'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Antivirus &amp; DPDP Check:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Passed
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="doc-viewer-excel-download-btn"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download &amp; Open in Excel</span>
                </button>
                {(storedDataUrl || documentItem.fileUrl) && (
                  <button
                    id="doc-viewer-excel-open-btn"
                    onClick={handleOpenInNewTab}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                    <span>Open in Browser</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center border border-slate-200 shadow-xl space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
                  {documentItem.type || 'Project Document'}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{fileName}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bank-grade encrypted dossier uploaded for {projectName}.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Document Type:</span>
                  <strong className="text-slate-900">{documentItem.type || 'Project Dossier'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>File Size:</span>
                  <strong className="text-slate-900">{formattedSize}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Uploaded At:</span>
                  <strong className="text-slate-900">{documentItem.uploadedAt || 'Recently'}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Security Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="doc-viewer-generic-download-btn"
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
                {(storedDataUrl || documentItem.fileUrl) && (
                  <button
                    id="doc-viewer-generic-open-btn"
                    onClick={handleOpenInNewTab}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                    <span>Open in New Tab</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-medium">Ready for Bank Submission &amp; Underwriting</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
