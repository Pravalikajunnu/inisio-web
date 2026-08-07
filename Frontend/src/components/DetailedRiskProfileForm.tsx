import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  Wallet,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Unlock,
  Lock,
  Check,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export interface DetailedRiskProfileData {
  industryExperience: string;
  educationalBackground: string;
  businessConstitution: string;
  businessVintage: string;
  contributionType: string;
  collateralCoveragePct: string;
  debtEquityRatio: string;
  isDebtEquityOverridden: boolean;
  managementTeamSize: string;
  technicalWorkforceCount: string;
  cibilScore: string;
  isNewToCredit: boolean;
}

interface DetailedRiskProfileFormProps {
  isUnlocked: boolean;
  onSubmitSuccess: (data: DetailedRiskProfileData) => void;
  defaultEquityPercent?: number; // e.g. 25 -> D:E is 75:25 (3:1)
  defaultPromoterExpYears?: number; // e.g. 8 -> '6–10 Years'
  theme?: 'light' | 'dark';
  sectionId?: string;
}

export function DetailedRiskProfileForm({
  isUnlocked,
  onSubmitSuccess,
  defaultEquityPercent = 25,
  defaultPromoterExpYears,
  theme = 'light',
  sectionId = 'risk-profile-section'
}: DetailedRiskProfileFormProps) {
  // Compute default Debt-Equity ratio string
  const getAutoDebtEquity = (eqPercent: number) => {
    const debt = Math.max(0, 100 - eqPercent);
    const ratioVal = eqPercent > 0 ? (debt / eqPercent).toFixed(1) : '3.0';
    return `${debt}:${eqPercent} (${ratioVal}:1)`;
  };

  const [formData, setFormData] = useState<DetailedRiskProfileData>({
    industryExperience: '',
    educationalBackground: '',
    businessConstitution: '',
    businessVintage: '',
    contributionType: '',
    collateralCoveragePct: '',
    debtEquityRatio: defaultEquityPercent ? getAutoDebtEquity(defaultEquityPercent) : '',
    isDebtEquityOverridden: false,
    managementTeamSize: '',
    technicalWorkforceCount: '',
    cibilScore: '',
    isNewToCredit: false
  });

  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto calculate DE ratio if not manually overridden and defaultEquityPercent changes
  useEffect(() => {
    if (!formData.isDebtEquityOverridden && defaultEquityPercent) {
      setFormData((prev) => ({
        ...prev,
        debtEquityRatio: getAutoDebtEquity(defaultEquityPercent)
      }));
    }
  }, [defaultEquityPercent]);

  // Collateral Classification helper
  const getCollateralClassification = (valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) return null;
    if (num < 50) return { label: 'Low', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (num <= 100) return { label: 'Moderate', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    return { label: 'Strong', color: 'bg-blue-100 text-blue-800 border-blue-300' };
  };

  // CIBIL Classification helper
  const getCibilClassification = (scoreStr: string, isNew: boolean) => {
    if (isNew) return { label: 'New to Credit', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    const num = parseInt(scoreStr, 10);
    if (isNaN(num)) return null;
    if (num >= 750) return { label: 'Excellent (750+)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (num >= 700) return { label: 'Good (700–749)', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    if (num >= 650) return { label: 'Average (650–699)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    return { label: 'High Risk (<650)', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const collateralClass = getCollateralClassification(formData.collateralCoveragePct);
  const cibilClass = getCibilClassification(formData.cibilScore, formData.isNewToCredit);

  // Helper to identify unselected / missing fields
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!formData.industryExperience) missing.push('Industry Experience (Section 1)');
    if (!formData.educationalBackground) missing.push('Educational Background (Section 1)');
    if (!formData.businessConstitution) missing.push('Business Constitution (Section 2)');
    if (!formData.businessVintage) missing.push('Business Vintage (Section 2)');
    if (!formData.contributionType) missing.push('Promoter Contribution Type (Section 3)');
    if (!formData.collateralCoveragePct) {
      missing.push('Collateral Coverage % (Section 3)');
    } else {
      const colVal = parseFloat(formData.collateralCoveragePct);
      if (isNaN(colVal) || colVal < 0 || colVal > 200) {
        missing.push('Valid Collateral Coverage % (0–200%)');
      }
    }
    if (!formData.debtEquityRatio) missing.push('Debt-Equity Ratio (Section 3)');
    if (!formData.managementTeamSize) {
      missing.push('Management Team Size (Section 4)');
    } else {
      const mgmt = parseInt(formData.managementTeamSize, 10);
      if (isNaN(mgmt) || mgmt <= 0) missing.push('Valid Management Team Size (>=1)');
    }
    if (!formData.technicalWorkforceCount) {
      missing.push('Technical Workforce Count (Section 4)');
    } else {
      const tech = parseInt(formData.technicalWorkforceCount, 10);
      if (isNaN(tech) || tech < 0) missing.push('Valid Technical Workforce Count (>=0)');
    }
    if (!formData.isNewToCredit) {
      if (!formData.cibilScore) {
        missing.push('CIBIL Score (Section 5)');
      } else {
        const cib = parseInt(formData.cibilScore, 10);
        if (isNaN(cib) || cib < 300 || cib > 900) missing.push('Valid CIBIL Score (300–900)');
      }
    }
    return missing;
  };

  const missingFields = getMissingFields();
  const isFormComplete = missingFields.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (missingFields.length > 0) {
      setFormError(`Please complete all parameters across all 5 sections before submitting.`);
      return;
    }

    // Success
    setSuccessMsg('Risk Profile evaluated and saved successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
    onSubmitSuccess(formData);
  };

  const isDark = theme === 'dark';

  return (
    <div
      id={sectionId}
      className={`rounded-2xl border shadow-xl overflow-hidden transition-all ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isUnlocked
            ? 'bg-blue-950 text-white border-blue-800'
            : isDark
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-slate-900 text-white border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              isUnlocked ? 'bg-blue-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}
          >
            {isUnlocked ? <ShieldCheck className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-manrope text-white">
                Detailed Risk Profile & Underwriting Assessment
              </h3>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                  isUnlocked
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isUnlocked ? 'Unlocked & Evaluated' : 'Required to Unlock Teaser & PDF'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isUnlocked
                ? 'All underwriting metrics are saved. Re-evaluate anytime to adjust risk scoring.'
                : 'Complete all 5 risk sections below to unlock Executive Teaser & PDF Report download.'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">

        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs font-semibold animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-800 text-xs font-semibold animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: PROMOTER PROFILE */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-gray-200/60 dark:border-slate-700">
              <UserCheck className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-800 dark:text-gray-100">
                👤 Section 1: Promoter Profile
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industry Experience - Radio Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Industry Experience <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['0–2 Years', '3–5 Years', '6–10 Years', '10+ Years'].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        formData.industryExperience === opt
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="industryExperience"
                        value={opt}
                        checked={formData.industryExperience === opt}
                        onChange={(e) => setFormData({ ...formData, industryExperience: e.target.value })}
                        className="sr-only"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Educational Background - Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Educational Background <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.educationalBackground}
                  onChange={(e) => setFormData({ ...formData, educationalBackground: e.target.value })}
                  className={`w-full p-3 text-xs font-medium rounded-xl border outline-none transition-all ${
                    !formData.educationalBackground ? 'text-gray-400 dark:text-gray-500' : ''
                  } ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="" disabled hidden>Select Educational Background *</option>
                  <option value="Graduate" className="text-gray-900 dark:text-white">Graduate</option>
                  <option value="Post Graduate" className="text-gray-900 dark:text-white">Post Graduate</option>
                  <option value="Technical / Professional Degree" className="text-gray-900 dark:text-white">Technical / Professional Degree</option>
                  <option value="Diploma" className="text-gray-900 dark:text-white">Diploma</option>
                  <option value="Others" className="text-gray-900 dark:text-white">Others</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: BUSINESS INFORMATION */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-gray-200/60 dark:border-slate-700">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-800 dark:text-gray-100">
                🏢 Section 2: Business Information
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Constitution - Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Business Constitution <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.businessConstitution}
                  onChange={(e) => setFormData({ ...formData, businessConstitution: e.target.value })}
                  className={`w-full p-3 text-xs font-medium rounded-xl border outline-none transition-all ${
                    !formData.businessConstitution ? 'text-gray-400 dark:text-gray-500' : ''
                  } ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                >
                  <option value="" disabled hidden>Select Business Constitution *</option>
                  <option value="Proprietorship" className="text-gray-900 dark:text-white">Proprietorship</option>
                  <option value="Partnership" className="text-gray-900 dark:text-white">Partnership</option>
                  <option value="LLP" className="text-gray-900 dark:text-white">LLP</option>
                  <option value="Private Limited" className="text-gray-900 dark:text-white">Private Limited</option>
                  <option value="Public Limited" className="text-gray-900 dark:text-white">Public Limited</option>
                </select>
              </div>

              {/* Business Vintage - Segmented Radio Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Business Vintage <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['New Business', '1–3 Years', '4–7 Years', '8+ Years'].map((vint) => (
                    <label
                      key={vint}
                      className={`flex items-center justify-center p-2.5 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        formData.businessVintage === vint
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="businessVintage"
                        value={vint}
                        checked={formData.businessVintage === vint}
                        onChange={(e) => setFormData({ ...formData, businessVintage: e.target.value })}
                        className="sr-only"
                      />
                      <span>{vint}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: FINANCIAL PROFILE */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-gray-200/60 dark:border-slate-700">
              <Wallet className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-800 dark:text-gray-100">
                💰 Section 3: Financial Profile
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Promoter Contribution Type - Radio Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Promoter Contribution Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {['Cash', 'Land', 'Existing Assets'].map((ctype) => (
                    <label
                      key={ctype}
                      className={`flex items-center px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        formData.contributionType === ctype
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500'
                          : isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contributionType"
                        value={ctype}
                        checked={formData.contributionType === ctype}
                        onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{ctype}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Collateral Coverage (%) - Numeric Input & Auto Classification */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Collateral Coverage (%) <span className="text-red-500">*</span>
                  </label>
                  {collateralClass && (
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${collateralClass.color}`}>
                      {collateralClass.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    step="1"
                    value={formData.collateralCoveragePct}
                    onChange={(e) => setFormData({ ...formData, collateralCoveragePct: e.target.value })}
                    placeholder="Enter Collateral Coverage %"
                    className={`w-full p-3 pr-8 text-xs font-bold rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-gray-400">%</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                  &lt;50% Low • 50–100% Moderate • &gt;100% Strong
                </p>
              </div>

              {/* Debt-Equity Ratio - Auto Calculated & Override Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Debt–Equity Ratio <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isDebtEquityOverridden: !prev.isDebtEquityOverridden
                      }))
                    }
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{formData.isDebtEquityOverridden ? 'Reset Auto' : 'Manual Edit'}</span>
                  </button>
                </div>

                {formData.isDebtEquityOverridden ? (
                  <input
                    type="text"
                    value={formData.debtEquityRatio}
                    onChange={(e) => setFormData({ ...formData, debtEquityRatio: e.target.value })}
                    placeholder="Enter Debt–Equity Ratio"
                    className={`w-full p-3 text-xs font-bold rounded-xl border outline-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                ) : (
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                  }`}>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                      {formData.debtEquityRatio || 'N/A'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-700">
                      <Check className="w-3 h-3 text-blue-600" /> Auto Calculated
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                  Derived from equity contribution percentage.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: MANAGEMENT DETAILS */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-gray-200/60 dark:border-slate-700">
              <Users className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-800 dark:text-gray-100">
                👥 Section 4: Management Details
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Management Team Size */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Management Team Size <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.managementTeamSize}
                    onChange={(e) => setFormData({ ...formData, managementTeamSize: e.target.value })}
                    placeholder="Enter Management Team Size"
                    className={`w-full p-3 text-xs font-bold rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                  Key directors & decision makers (min 1 member).
                </p>
              </div>

              {/* Technical Workforce Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-700 dark:text-gray-300">
                  Technical Workforce Count <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.technicalWorkforceCount}
                    onChange={(e) => setFormData({ ...formData, technicalWorkforceCount: e.target.value })}
                    placeholder="Enter Technical Workforce Count"
                    className={`w-full p-3 text-xs font-bold rounded-xl border outline-none transition-all ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                        : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                  Engineers, operators, and technical staff.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5: CREDIT PROFILE */}
          <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-200/80'}`}>
            <div className="flex items-center gap-2.5 mb-4 border-b pb-3 border-gray-200/60 dark:border-slate-700">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-800 dark:text-gray-100">
                🏦 Section 5: Credit Profile
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* CIBIL Score Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    CIBIL / Credit Score {!formData.isNewToCredit && <span className="text-red-500">*</span>}
                  </label>
                  {cibilClass && (
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${cibilClass.color}`}>
                      {cibilClass.label}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="300"
                  max="900"
                  step="1"
                  disabled={formData.isNewToCredit}
                  value={formData.isNewToCredit ? '' : formData.cibilScore}
                  onChange={(e) => setFormData({ ...formData, cibilScore: e.target.value })}
                  placeholder={formData.isNewToCredit ? 'N/A (New to Credit)' : 'Enter CIBIL Score'}
                  className={`w-full p-3 text-xs font-bold rounded-xl border outline-none transition-all ${
                    formData.isNewToCredit
                      ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                      : isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
                  Range: 300–900 • 750+ Excellent, 700–749 Good, 650–699 Average, &lt;650 High Risk.
                </p>
              </div>

              {/* Checkbox: New to Credit */}
              <div className="pt-2 md:pt-7">
                <label className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.isNewToCredit
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200 dark:border-indigo-500'
                    : isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isNewToCredit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isNewToCredit: e.target.checked
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="text-xs font-bold">New to Credit / First Time Borrower</span>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Check if no prior loan history or CIBIL score is established.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200/60 dark:border-slate-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {isUnlocked
                ? '✓ Risk profile verified. You can re-submit to update your metrics anytime.'
                : isFormComplete
                ? '✓ All 5 sections completed. Ready to submit & unlock Teaser.'
                : `⚠️ ${missingFields.length} field${missingFields.length > 1 ? 's' : ''} remaining across 5 sections.`}
            </p>
            <button
              type="submit"
              disabled={!isFormComplete && !isUnlocked}
              className={`w-full sm:w-auto px-7 py-3.5 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isFormComplete || isUnlocked
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-blue-600/20'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700 opacity-60'
              }`}
              title={!isFormComplete && !isUnlocked ? `Complete ${missingFields.length} remaining fields to enable submit` : ''}
            >
              {isUnlocked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-blue-200" />
                  <span>Update & Re-evaluate Risk Profile</span>
                </>
              ) : (
                <>
                  {isFormComplete ? (
                    <Sparkles className="w-4 h-4 text-blue-200" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Submit Risk Profile & Unlock Teaser</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

