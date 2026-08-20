import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  Wallet,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export interface DetailedRiskProfileData {
  industryExperience: string;
  educationalBackground: string;
  businessConstitution: string;
  businessVintage: string;
  contributionType: string;
  collateralCoveragePct: string;
  debtEquityRatio: string;
  managementTeamSize: string;
  technicalWorkforceCount: string;
  cibilScore: string;
  isNewToCredit: boolean;
}

interface DetailedRiskProfileFormProps {
  isUnlocked?: boolean;
  onSubmitSuccess: (data: DetailedRiskProfileData) => void;
  defaultEquityPercent?: number;
  defaultPromoterExpYears?: number;
  initialData?: DetailedRiskProfileData | null;
  theme?: string;
  sectionId?: string;
}

export function DetailedRiskProfileForm({
  onSubmitSuccess,
  defaultEquityPercent = 25,
  defaultPromoterExpYears,
  initialData,
  sectionId = 'risk-profile-section'
}: DetailedRiskProfileFormProps) {
  // Compute default debt:equity ratio automatically (e.g. 75:25)
  const calcDebtPct = defaultEquityPercent ? Math.round(100 - defaultEquityPercent) : 75;
  const calcEqPct = defaultEquityPercent ? Math.round(defaultEquityPercent) : 25;
  const autoRatio = `${calcDebtPct}:${calcEqPct}`;

  const [formData, setFormData] = useState<DetailedRiskProfileData>({
    industryExperience: initialData?.industryExperience || '',
    educationalBackground: initialData?.educationalBackground || '',
    businessConstitution: initialData?.businessConstitution || '',
    businessVintage: initialData?.businessVintage || '',
    contributionType: initialData?.contributionType || '',
    collateralCoveragePct: initialData?.collateralCoveragePct || '',
    debtEquityRatio: initialData?.debtEquityRatio || autoRatio,
    managementTeamSize: initialData?.managementTeamSize || '',
    technicalWorkforceCount: initialData?.technicalWorkforceCount || '',
    cibilScore: initialData?.cibilScore || '',
    isNewToCredit: initialData?.isNewToCredit || false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        debtEquityRatio: initialData.debtEquityRatio || prev.debtEquityRatio || autoRatio
      }));
    }
  }, [initialData, autoRatio]);

  useEffect(() => {
    if (defaultEquityPercent && !initialData?.debtEquityRatio) {
      const d = Math.round(100 - defaultEquityPercent);
      const e = Math.round(defaultEquityPercent);
      setFormData(prev => ({ ...prev, debtEquityRatio: `${d}:${e}` }));
    }
  }, [defaultEquityPercent, initialData]);

  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.industryExperience) {
      setFormError('Please select Industry Experience.');
      return;
    }
    if (!formData.educationalBackground) {
      setFormError('Please select Educational Background.');
      return;
    }
    if (!formData.businessConstitution) {
      setFormError('Please select Business Constitution.');
      return;
    }
    if (!formData.businessVintage) {
      setFormError('Please select Business Vintage.');
      return;
    }
    if (!formData.contributionType) {
      setFormError('Please select Promoter Contribution Type.');
      return;
    }
    if (!formData.collateralCoveragePct) {
      setFormError('Please enter Collateral Coverage % (e.g. 100).');
      return;
    }
    if (!formData.managementTeamSize) {
      setFormError('Please enter Management Team Size.');
      return;
    }
    if (!formData.technicalWorkforceCount) {
      setFormError('Please enter Technical Staff / Engineers Count.');
      return;
    }
    if (!formData.isNewToCredit && !formData.cibilScore) {
      setFormError('Please enter CIBIL / Credit Score or check New to Credit.');
      return;
    }

    onSubmitSuccess(formData);
  };

  return (
    <div
      id={sectionId}
      className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300"
    >
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 text-white flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-manrope text-white">
            Underwriting &amp; Bankability Details
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Please provide your details below to calculate your bankability rating.
          </p>
        </div>
        <div className="hidden sm:block text-xs font-semibold text-blue-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          User Input Form
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* SECTION 1: PROMOTER PROFILE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Promoter Experience &amp; Education
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Industry Experience <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.industryExperience}
                onChange={(e) => setFormData({ ...formData, industryExperience: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.industryExperience ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Industry Experience</option>
                {formData.industryExperience && !['0 to 2 Years (New Promoter)', '3 to 5 Years', '6 to 10 Years', 'More than 10 Years'].includes(formData.industryExperience) && (
                  <option value={formData.industryExperience}>{formData.industryExperience}</option>
                )}
                <option value="0 to 2 Years (New Promoter)" className="text-slate-900">0 to 2 Years (New Promoter)</option>
                <option value="3 to 5 Years" className="text-slate-900">3 to 5 Years</option>
                <option value="6 to 10 Years" className="text-slate-900">6 to 10 Years</option>
                <option value="More than 10 Years" className="text-slate-900">More than 10 Years</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Educational Background <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.educationalBackground}
                onChange={(e) => setFormData({ ...formData, educationalBackground: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.educationalBackground ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Educational Background</option>
                <option value="Graduate (Degree)" className="text-slate-900">Graduate (Degree)</option>
                <option value="Post Graduate (Master's / MBA)" className="text-slate-900">Post Graduate (Master's / MBA)</option>
                <option value="Engineering / Technical Degree" className="text-slate-900">Engineering / Technical Degree</option>
                <option value="CA / Finance Professional" className="text-slate-900">CA / Finance Professional</option>
                <option value="Diploma / School" className="text-slate-900">Diploma / School</option>
                <option value="Other Education" className="text-slate-900">Other Education</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: BUSINESS INFORMATION */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Business Constitution &amp; Vintage
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Business Constitution <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessConstitution}
                onChange={(e) => setFormData({ ...formData, businessConstitution: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.businessConstitution ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Business Constitution</option>
                <option value="Private Limited Company" className="text-slate-900">Private Limited Company</option>
                <option value="Public Limited Company" className="text-slate-900">Public Limited Company</option>
                <option value="Limited Liability Partnership (LLP)" className="text-slate-900">Limited Liability Partnership (LLP)</option>
                <option value="Partnership Firm" className="text-slate-900">Partnership Firm</option>
                <option value="Sole Proprietorship" className="text-slate-900">Sole Proprietorship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Business Vintage (Years in Operation) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessVintage}
                onChange={(e) => setFormData({ ...formData, businessVintage: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.businessVintage ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Business Vintage</option>
                <option value="New Company / Startup (0 Years)" className="text-slate-900">New Company / Startup (0 Years)</option>
                <option value="1 to 3 Years" className="text-slate-900">1 to 3 Years</option>
                <option value="4 to 7 Years" className="text-slate-900">4 to 7 Years</option>
                <option value="More than 8 Years" className="text-slate-900">More than 8 Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: FINANCIAL & COLLATERAL */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Wallet className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Contribution &amp; Collateral
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contribution Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.contributionType}
                onChange={(e) => setFormData({ ...formData, contributionType: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.contributionType ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Contribution Type</option>
                <option value="Cash / Bank Balance" className="text-slate-900">Cash / Bank Balance</option>
                <option value="Land Owned" className="text-slate-900">Land Owned</option>
                <option value="Existing Plant & Machinery" className="text-slate-900">Existing Plant &amp; Machinery</option>
                <option value="Combination of Cash & Land" className="text-slate-900">Combination of Cash &amp; Land</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Collateral Coverage % <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={formData.collateralCoveragePct}
                onChange={(e) => setFormData({ ...formData, collateralCoveragePct: e.target.value })}
                placeholder="Enter collateral coverage % (e.g. 100)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Debt-Equity Ratio (Auto-Calculated)
              </label>
              <input
                type="text"
                value={formData.debtEquityRatio}
                onChange={(e) => setFormData({ ...formData, debtEquityRatio: e.target.value })}
                placeholder="Automatically calculated (e.g. 75:25)"
                className="w-full px-3.5 py-2.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: MANAGEMENT & WORKFORCE */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              4. Management &amp; Technical Workforce
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Management / Director Team Size <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.managementTeamSize}
                onChange={(e) => setFormData({ ...formData, managementTeamSize: e.target.value })}
                placeholder="Enter management / directors count (e.g. 3)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Technical Staff / Engineers Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.technicalWorkforceCount}
                onChange={(e) => setFormData({ ...formData, technicalWorkforceCount: e.target.value })}
                placeholder="Enter technical staff / engineers count (e.g. 10)"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: CIBIL SCORE */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              5. Promoter Credit / CIBIL Score
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                CIBIL / Credit Score {!formData.isNewToCredit && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                min="300"
                max="900"
                disabled={formData.isNewToCredit}
                value={formData.isNewToCredit ? '' : formData.cibilScore}
                onChange={(e) => setFormData({ ...formData, cibilScore: e.target.value })}
                placeholder={formData.isNewToCredit ? 'New to Credit (No past record)' : 'Enter promoter CIBIL score (e.g. 750)'}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium outline-none border ${
                  formData.isNewToCredit
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500'
                }`}
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNewToCredit}
                  onChange={(e) => setFormData({ ...formData, isNewToCredit: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300"
                />
                <span>Promoter is New to Credit (No past loan history)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 flex items-center justify-end border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Calculate Bankability Rating</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
