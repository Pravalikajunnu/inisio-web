import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Edit3,
  Save,
  PlusCircle,
  HelpCircle,
  Hash
} from 'lucide-react';

interface BankApplicationTrackerProps {
  bankName?: string;
  branchLocation?: string;
  bankIfscCode?: string;
  bankAppRefNumber?: string;
  bankApplicationStatus?: string;
  dprTimelineRollbackReason?: string;
  dprTargetDate?: string;
  dprStageRollback?: boolean;
  totalCostCr?: string | number;
  loanRequiredCr?: string | number;
  onSaveBankDetails?: (details: {
    bankName: string;
    branchLocation: string;
    bankIfscCode?: string;
    bankAppRefNumber?: string;
    bankApplicationStatus?: string;
  }) => void;
  isReadOnly?: boolean;
}

export const BankApplicationTracker: React.FC<BankApplicationTrackerProps> = ({
  bankName = '',
  branchLocation = '',
  bankIfscCode = '',
  bankAppRefNumber = '',
  bankApplicationStatus = '',
  dprTimelineRollbackReason,
  dprTargetDate,
  dprStageRollback,
  onSaveBankDetails,
  isReadOnly = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentBankName, setCurrentBankName] = useState(bankName || '');
  const [currentBranchLocation, setCurrentBranchLocation] = useState(branchLocation || '');
  const [currentIfsc, setCurrentIfsc] = useState(bankIfscCode || '');
  const [currentRefNumber, setCurrentRefNumber] = useState(bankAppRefNumber || '');
  const [currentStatus, setCurrentStatus] = useState(bankApplicationStatus || 'Draft Filing / Pre-Sanction Review');
  const [isCustomBank, setIsCustomBank] = useState(false);

  const bankOptions = [
    'State Bank of India (SBI)',
    'Punjab National Bank (PNB)',
    'Canara Bank',
    'Bank of Baroda (BOB)',
    'Union Bank of India',
    'Indian Bank',
    'Bank of India',
    'Central Bank of India',
    'HDFC Bank (Commercial Banking)',
    'ICICI Bank (Corporate & SME)',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Federal Bank',
    'SIDBI (Small Industries Development Bank of India)',
    'NABARD / State Financial Corporation (SFC)',
    'Other / Custom Bank'
  ];

  // Sync state when props update
  useEffect(() => {
    setCurrentBankName(bankName || '');
    setCurrentBranchLocation(branchLocation || '');
    setCurrentIfsc(bankIfscCode || '');
    setCurrentRefNumber(bankAppRefNumber || '');
    setCurrentStatus(bankApplicationStatus || 'Draft Filing / Pre-Sanction Review');
    
    if (bankName && !bankOptions.includes(bankName)) {
      setIsCustomBank(true);
    } else {
      setIsCustomBank(false);
    }
  }, [bankName, branchLocation, bankIfscCode, bankAppRefNumber, bankApplicationStatus]);

  const handleBankSelectChange = (value: string) => {
    if (value === 'Other / Custom Bank') {
      setIsCustomBank(true);
      setCurrentBankName('');
    } else {
      setIsCustomBank(false);
      setCurrentBankName(value);
    }
  };

  const handleSave = () => {
    if (onSaveBankDetails) {
      onSaveBankDetails({
        bankName: currentBankName.trim(),
        branchLocation: currentBranchLocation.trim(),
        bankIfscCode: currentIfsc.trim().toUpperCase(),
        bankAppRefNumber: currentRefNumber.trim(),
        bankApplicationStatus: currentStatus
      });
    }
    setIsEditing(false);
  };

  const stages = [
    { name: 'DPR & CMA Submitted', done: Boolean(currentBankName) },
    { name: 'Branch Preliminary Appraisal', done: Boolean(currentBranchLocation) },
    { name: 'Credit Committee Review', active: Boolean(currentBankName) && !currentRefNumber, done: Boolean(currentRefNumber) },
    { name: 'Sanction Letter Issuance', done: currentStatus.toLowerCase().includes('sanction') || currentStatus.toLowerCase().includes('approved') },
    { name: 'Documentation & Disbursement', done: currentStatus.toLowerCase().includes('disburs') }
  ];

  const hasUserData = Boolean(currentBankName || currentBranchLocation || currentIfsc || currentRefNumber);

  return (
    <div className="border border-zinc-200 rounded-2xl p-5 sm:p-6 bg-white space-y-5 font-inter" id="bank-application-tracker">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">Bank Application &amp; Syndication Tracker</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter and track your designated loan financing bank and specific branch underwriting desk.
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Bank Details</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {hasUserData ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Bank Details</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Bank &amp; Branch</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5 bg-zinc-50 rounded-xl border border-zinc-200">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wider">
              Assigned / Target Bank *
            </label>
            {!isCustomBank ? (
              <div className="space-y-1.5">
                <select
                  value={currentBankName}
                  onChange={(e) => handleBankSelectChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="">Select your preferred bank...</option>
                  {bankOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomBank(true)}
                  className="text-[10px] text-blue-600 hover:underline font-medium block"
                >
                  + Type custom bank name
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={currentBankName}
                  onChange={(e) => setCurrentBankName(e.target.value)}
                  placeholder="Type full name of the bank..."
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomBank(false)}
                  className="text-[10px] text-zinc-500 hover:underline block"
                >
                  ← Choose from standard bank list
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wider">
              Specific Branch Name / Location *
            </label>
            <input
              type="text"
              value={currentBranchLocation}
              onChange={(e) => setCurrentBranchLocation(e.target.value)}
              placeholder="e.g. Commercial Branch, MG Road, Bengaluru"
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wider">
              Branch IFSC Code (Optional)
            </label>
            <input
              type="text"
              value={currentIfsc}
              onChange={(e) => setCurrentIfsc(e.target.value.toUpperCase())}
              placeholder="e.g. SBIN0001234 / HDFC0000456"
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wider">
              Bank Application / Proposal File Ref Number (Optional)
            </label>
            <input
              type="text"
              value={currentRefNumber}
              onChange={(e) => setCurrentRefNumber(e.target.value)}
              placeholder="e.g. SME-PROJ-2026-081"
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-zinc-700 mb-1 uppercase tracking-wider">
              Current Banking Appraisal Stage
            </label>
            <select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
            >
              <option value="Draft Filing / Pre-Sanction Review">Draft Filing / Pre-Sanction Review</option>
              <option value="Submitted to Bank Branch">Submitted to Bank Branch</option>
              <option value="In Credit Committee Appraisal">In Credit Committee Appraisal</option>
              <option value="Sanction In-Principle Issued">Sanction In-Principle Issued</option>
              <option value="Final Sanction Letter Delivered">Final Sanction Letter Delivered</option>
              <option value="Disbursed to Escrow / Project Account">Disbursed to Escrow / Project Account</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">
                Target / Assigned Bank
              </span>
              <strong className="text-zinc-900 block font-bold text-sm truncate">
                {currentBankName || <span className="text-zinc-400 font-normal italic">Not Specified</span>}
              </strong>
              <span className="text-[11px] text-zinc-500">Lead Syndicate Bank</span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">
                Branch Location
              </span>
              <strong className="text-zinc-900 block font-semibold truncate flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>{currentBranchLocation || <span className="text-zinc-400 font-normal italic">Not Specified</span>}</span>
              </strong>
              <span className="text-[11px] text-zinc-500 font-mono">
                {currentIfsc ? `IFSC: ${currentIfsc}` : 'IFSC: Not Provided'}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">
                Application Tracking Ref
              </span>
              <strong className="text-zinc-900 block font-mono font-bold">
                {currentRefNumber || <span className="text-zinc-400 font-normal italic">Pending Ref #</span>}
              </strong>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {currentRefNumber ? 'Priority File Tracked' : 'Direct Branch Filing'}
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1">
              <span className="text-zinc-400 font-medium uppercase tracking-wider block text-[10px]">
                Appraisal Status
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-800 text-[11px] font-bold">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>{currentStatus || 'Pre-Sanction Review'}</span>
              </div>
              <span className="text-[10px] text-zinc-500 block">Underwriting desk</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Bank Syndication Workflow
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {stages.map((st, i) => (
                <div
                  key={st.name}
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    st.done
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : st.active
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-2 ring-blue-500/20'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    st.done ? 'bg-emerald-600 text-white' : st.active ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {st.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-[11px] truncate">{st.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
