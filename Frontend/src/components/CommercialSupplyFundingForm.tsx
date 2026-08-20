import React, { useState } from 'react';
import {
  Truck,
  Users2,
  Building,
  Coins,
  FileCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';

export interface CommercialSupplyFundingData {
  // Suppliers and Off-Take Buyers
  rawMaterialSource: string;
  keySuppliersList: string;
  procurementRadiusKm: string;
  primaryBuyersType: string;
  keyBuyersList: string;
  offTakeAgreementStatus: string;

  // Project Funding Facilities
  targetBankCategory: string;
  requestedFacilityTypes: string[];
  moratoriumPeriodMonths: string;
  repaymentTenureYears: string;
  machineryCostLakhs: string;
  civilCostLakhs: string;
  consultancyCostLakhs: string;
  gstNumber: string;
}

interface CommercialSupplyFundingFormProps {
  initialCostCr: number;
  initialLoanCr: number;
  initialIndustry: string;
  projectName: string;
  initialData?: CommercialSupplyFundingData | null;
  onSubmitSuccess: (data: CommercialSupplyFundingData) => void;
  sectionId?: string;
}

export const CommercialSupplyFundingForm: React.FC<CommercialSupplyFundingFormProps> = ({
  initialCostCr,
  initialLoanCr,
  initialIndustry,
  projectName,
  initialData,
  onSubmitSuccess,
  sectionId = 'commercial-funding-section'
}) => {
  // Compute default estimates in lakhs based on cost
  const totalLakhs = initialCostCr ? initialCostCr * 100 : 0;
  const defaultMachinery = totalLakhs ? (totalLakhs * 0.68).toFixed(2) : '';
  const defaultCivil = totalLakhs ? (totalLakhs * 0.30).toFixed(2) : '';
  const defaultConsultancy = totalLakhs ? (totalLakhs * 0.02).toFixed(2) : '';

  const [formData, setFormData] = useState<CommercialSupplyFundingData>({
    rawMaterialSource: initialData?.rawMaterialSource || 'Industrial Vendors & Distributors',
    keySuppliersList: initialData?.keySuppliersList || '',
    procurementRadiusKm: initialData?.procurementRadiusKm || '50 to 100 KM',
    primaryBuyersType: initialData?.primaryBuyersType || 'Industrial Companies & Factories',
    keyBuyersList: initialData?.keyBuyersList || '',
    offTakeAgreementStatus: initialData?.offTakeAgreementStatus || 'MoU / Expression of Interest (EOI) Done',
    targetBankCategory: initialData?.targetBankCategory || 'Public Sector Banks (SBI / PNB / Canara / BOB)',
    requestedFacilityTypes: initialData?.requestedFacilityTypes && initialData.requestedFacilityTypes.length > 0 
      ? initialData.requestedFacilityTypes 
      : ['Term Loan (Machinery & Construction)', 'Working Capital Loan (CC / OD)'],
    moratoriumPeriodMonths: initialData?.moratoriumPeriodMonths || '12 Months',
    repaymentTenureYears: initialData?.repaymentTenureYears || '8 to 10 Years',
    machineryCostLakhs: initialData?.machineryCostLakhs || defaultMachinery,
    civilCostLakhs: initialData?.civilCostLakhs || defaultCivil,
    consultancyCostLakhs: initialData?.consultancyCostLakhs || defaultConsultancy,
    gstNumber: initialData?.gstNumber || ''
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        machineryCostLakhs: initialData.machineryCostLakhs || prev.machineryCostLakhs || defaultMachinery,
        civilCostLakhs: initialData.civilCostLakhs || prev.civilCostLakhs || defaultCivil,
        consultancyCostLakhs: initialData.consultancyCostLakhs || prev.consultancyCostLakhs || defaultConsultancy
      }));
    }
  }, [initialData, defaultMachinery, defaultCivil, defaultConsultancy]);

  const [formError, setFormError] = useState('');

  const handleFacilityToggle = (type: string) => {
    setFormData(prev => {
      const exists = prev.requestedFacilityTypes.includes(type);
      const updated = exists
        ? prev.requestedFacilityTypes.filter(t => t !== type)
        : [...prev.requestedFacilityTypes, type];
      return { ...prev, requestedFacilityTypes: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.rawMaterialSource) {
      setFormError('Please select Raw Material Source.');
      return;
    }
    if (!formData.procurementRadiusKm) {
      setFormError('Please select Procurement Distance Radius.');
      return;
    }
    if (!formData.primaryBuyersType) {
      setFormError('Please select Primary Buyer Type.');
      return;
    }
    if (!formData.offTakeAgreementStatus) {
      setFormError('Please select Buyer Agreement Status.');
      return;
    }

    onSubmitSuccess(formData);
  };

  return (
    <div id={sectionId} className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5 border-b border-slate-800 text-white flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold font-manrope text-white">
            Suppliers, Buyers &amp; Project Funding Facilities
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Fill in your supply chain, target buyers, and requested bank loan facilities.
          </p>
        </div>
        <div className="hidden sm:block text-xs font-semibold text-blue-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          User Input Form
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-800">
            {formError}
          </div>
        )}

        {/* SECTION 1: SUPPLIERS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Truck className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Raw Material &amp; Upstream Suppliers
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Raw Material Source <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.rawMaterialSource}
                onChange={(e) => setFormData({ ...formData, rawMaterialSource: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.rawMaterialSource ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Raw Material Source</option>
                <option value="Direct Farmers & Aggregators" className="text-slate-900">Direct Farmers &amp; Aggregators</option>
                <option value="Local Wholesale Suppliers & Mandis" className="text-slate-900">Local Wholesale Suppliers &amp; Mandis</option>
                <option value="Industrial Vendors & Distributors" className="text-slate-900">Industrial Vendors &amp; Distributors</option>
                <option value="Imported Raw Material" className="text-slate-900">Imported Raw Material</option>
                <option value="Own Sourcing / Captive Supply" className="text-slate-900">Own Sourcing / Captive Supply</option>
                <option value="Other Sourcing Channels" className="text-slate-900">Other Sourcing Channels</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Procurement Distance Radius <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.procurementRadiusKm}
                onChange={(e) => setFormData({ ...formData, procurementRadiusKm: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.procurementRadiusKm ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Procurement Distance Radius</option>
                <option value="Within 25 KM (Local)" className="text-slate-900">Within 25 KM (Local)</option>
                <option value="25 to 50 KM (Regional)" className="text-slate-900">25 to 50 KM (Regional)</option>
                <option value="50 to 100 KM" className="text-slate-900">50 to 100 KM</option>
                <option value="100 to 250 KM" className="text-slate-900">100 to 250 KM</option>
                <option value="Across India / State-wide" className="text-slate-900">Across India / State-wide</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Key Suppliers / Vendor Names (Optional)
              </label>
              <input
                type="text"
                value={formData.keySuppliersList}
                onChange={(e) => setFormData({ ...formData, keySuppliersList: e.target.value })}
                placeholder="Enter key suppliers or vendor names (e.g. Local farmer groups, ABC Steel Traders, Tata Vendors)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BUYERS */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Target Buyers &amp; Off-Take Model
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Buyer Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.primaryBuyersType}
                onChange={(e) => setFormData({ ...formData, primaryBuyersType: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.primaryBuyersType ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Primary Buyer Type</option>
                <option value="Industrial Companies & Factories" className="text-slate-900">Industrial Companies &amp; Factories</option>
                <option value="Oil Marketing Companies (OMCs)" className="text-slate-900">Oil Marketing Companies (OMCs)</option>
                <option value="Wholesalers & Distributors" className="text-slate-900">Wholesalers &amp; Distributors</option>
                <option value="Retailers & Direct Consumers" className="text-slate-900">Retailers &amp; Direct Consumers</option>
                <option value="Government & Public Agencies" className="text-slate-900">Government &amp; Public Agencies</option>
                <option value="Export Buyers" className="text-slate-900">Export Buyers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Buyer Agreement Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.offTakeAgreementStatus}
                onChange={(e) => setFormData({ ...formData, offTakeAgreementStatus: e.target.value })}
                required
                className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.offTakeAgreementStatus ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Buyer Agreement Status</option>
                <option value="Signed Long-Term Agreement / Contract" className="text-slate-900">Signed Long-Term Agreement / Contract</option>
                <option value="MoU / Expression of Interest (EOI) Done" className="text-slate-900">MoU / Expression of Interest (EOI) Done</option>
                <option value="Letter of Intent (LOI) Received" className="text-slate-900">Letter of Intent (LOI) Received</option>
                <option value="Direct Market / Spot Sales" className="text-slate-900">Direct Market / Spot Sales</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Buyer Company Names (Optional)
              </label>
              <input
                type="text"
                value={formData.keyBuyersList}
                onChange={(e) => setFormData({ ...formData, keyBuyersList: e.target.value })}
                placeholder="Enter target buyer company names (e.g. Local retailers, ABC Food Corp, IOCL, City Gas, Wholesale market)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: BANKING FACILITIES & COST BREAKDOWN */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Coins className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3. Loan Facilities &amp; Cost Breakdown
            </h4>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Required Loan Types (Click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Term Loan (Machinery & Construction)',
                'Working Capital Loan (CC / OD)',
                'Letter of Credit (LC)',
                'Bank Guarantee (BG)',
                'Equipment Loan'
              ].map((facility) => {
                const isSelected = formData.requestedFacilityTypes.includes(facility);
                return (
                  <button
                    type="button"
                    key={facility}
                    onClick={() => handleFacilityToggle(facility)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                    <span>{facility}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Preferred Bank Type
              </label>
              <select
                value={formData.targetBankCategory}
                onChange={(e) => setFormData({ ...formData, targetBankCategory: e.target.value })}
                className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.targetBankCategory ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Preferred Bank Category</option>
                <option value="Public Sector Banks (SBI / PNB / Canara / BOB)" className="text-slate-900">Public Sector Banks (SBI, PNB, BOB, etc.)</option>
                <option value="Private Banks (HDFC / ICICI / Axis)" className="text-slate-900">Private Banks (HDFC, ICICI, Axis)</option>
                <option value="Government Institutions (SIDBI / IREDA / NABARD)" className="text-slate-900">Govt Institutions (SIDBI, IREDA, NABARD)</option>
                <option value="Cooperative / Regional Banks" className="text-slate-900">Cooperative / Regional Banks</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Moratorium Period
              </label>
              <select
                value={formData.moratoriumPeriodMonths}
                onChange={(e) => setFormData({ ...formData, moratoriumPeriodMonths: e.target.value })}
                className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.moratoriumPeriodMonths ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Moratorium Period</option>
                <option value="6 Months" className="text-slate-900">6 Months</option>
                <option value="12 Months" className="text-slate-900">12 Months (1 Year)</option>
                <option value="18 Months" className="text-slate-900">18 Months (1.5 Years)</option>
                <option value="24 Months" className="text-slate-900">24 Months (2 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Repayment Tenure
              </label>
              <select
                value={formData.repaymentTenureYears}
                onChange={(e) => setFormData({ ...formData, repaymentTenureYears: e.target.value })}
                className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${
                  formData.repaymentTenureYears ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <option value="" disabled hidden>Select Repayment Tenure</option>
                <option value="5 Years" className="text-slate-900">5 Years</option>
                <option value="7 Years" className="text-slate-900">7 Years</option>
                <option value="8 to 10 Years" className="text-slate-900">8 to 10 Years</option>
                <option value="12 Years" className="text-slate-900">12 Years</option>
              </select>
            </div>
          </div>

          {/* Project Cost Breakdown Inputs in Lakhs */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Cost Breakdown (in ₹ Lakhs)
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Total Cost: ₹ {initialCostCr} Cr ({initialCostCr * 100} Lakhs)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Plant &amp; Machinery (₹ Lakhs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.machineryCostLakhs}
                  onChange={(e) => setFormData({ ...formData, machineryCostLakhs: e.target.value })}
                  placeholder="Enter plant & machinery cost in ₹ Lakhs"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Civil Works &amp; Building (₹ Lakhs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.civilCostLakhs}
                  onChange={(e) => setFormData({ ...formData, civilCostLakhs: e.target.value })}
                  placeholder="Enter civil works & land cost in ₹ Lakhs"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Consultancy &amp; Fees (₹ Lakhs)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.consultancyCostLakhs}
                  onChange={(e) => setFormData({ ...formData, consultancyCostLakhs: e.target.value })}
                  placeholder="Enter consultancy & fees in ₹ Lakhs"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              GST Number (Optional)
            </label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              placeholder="Enter GST number (e.g. 36AAOCB2867M1Z0)"
              maxLength={15}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 flex items-center justify-end border-t border-slate-100">
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Generate Sample Teaser</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
