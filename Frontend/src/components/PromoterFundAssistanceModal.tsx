import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  HelpCircle,
  AlertCircle,
  Building,
  IndianRupee,
  Phone,
  MessageSquare,
  Mail,
  Users,
  CheckCircle2,
  ShieldCheck,
  Info
} from 'lucide-react';
import { AuthUser, PromoterFundAssistanceRequest, PromoterFundAssistanceStatus } from '../types';
import { updateLeadRecord, LeadRecord } from '../utils/leadStore';

interface PromoterFundAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id?: string;
    projectName?: string;
    totalCostCr?: number | string;
    loanRequiredCr?: number | string;
    promoterContribCr?: number | string;
    fullName?: string;
    mobile?: string;
    email?: string;
    promoterFundAssistanceStatus?: PromoterFundAssistanceStatus;
    promoterFundAssistanceRequest?: PromoterFundAssistanceRequest;
  } | null;
  user?: AuthUser | null;
  onRequestSubmitted?: (request: PromoterFundAssistanceRequest) => void;
}

export const PromoterFundAssistanceModal: React.FC<PromoterFundAssistanceModalProps> = ({
  isOpen,
  onClose,
  project,
  user,
  onRequestSubmitted
}) => {
  const [formData, setFormData] = useState({
    projectName: '',
    requiredAmountCr: '',
    totalCostCr: '',
    fundingReqCr: '',
    preferredContactMethod: 'WhatsApp',
    notes: '',
    customerName: '',
    customerMobile: '',
    customerEmail: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      const existingReq = project.promoterFundAssistanceRequest;
      setFormData({
        projectName: project.projectName || existingReq?.projectName || '',
        requiredAmountCr: String(
          existingReq?.requiredAmountCr || 
          project.promoterContribCr || 
          (Number(project.totalCostCr || 0) > 0 && Number(project.loanRequiredCr || 0) > 0 
            ? Math.max(0, Math.round((Number(project.totalCostCr) - Number(project.loanRequiredCr)) * 100) / 100) 
            : '')
        ),
        totalCostCr: String(existingReq?.totalCostCr || project.totalCostCr || ''),
        fundingReqCr: String(existingReq?.fundingReqCr || project.loanRequiredCr || ''),
        preferredContactMethod: existingReq?.preferredContactMethod || 'WhatsApp',
        notes: existingReq?.notes || '',
        customerName: existingReq?.customerName || project.fullName || user?.name || '',
        customerMobile: existingReq?.customerMobile || project.mobile || user?.phone || '',
        customerEmail: existingReq?.customerEmail || project.email || user?.email || ''
      });
      setShowSuccess(false);
    }
  }, [project, isOpen, user]);

  if (!isOpen) return null;

  const currentStatus: PromoterFundAssistanceStatus = project?.promoterFundAssistanceStatus || 'Not Requested';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsSubmitting(true);

    const requiredAmountNum = parseFloat(formData.requiredAmountCr) || 0;
    const totalCostNum = parseFloat(formData.totalCostCr) || 0;
    const fundingReqNum = parseFloat(formData.fundingReqCr) || 0;

    const requestPayload: PromoterFundAssistanceRequest = {
      id: `pfa-${Date.now()}`,
      projectId: project.id,
      projectName: formData.projectName || 'Greenfield Project',
      requiredAmountCr: requiredAmountNum || formData.requiredAmountCr,
      totalCostCr: totalCostNum || formData.totalCostCr,
      fundingReqCr: fundingReqNum || formData.fundingReqCr,
      preferredContactMethod: formData.preferredContactMethod,
      notes: formData.notes,
      status: 'Request Submitted',
      requestedAt: new Date().toISOString(),
      requestedBy: user?.name || user?.email || 'Promoter',
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      customerEmail: formData.customerEmail
    };

    if (project.id) {
      updateLeadRecord(project.id, {
        promoterContributionAvailable: 'No',
        promoterFundAssistanceStatus: 'Request Submitted',
        promoterFundAssistanceRequest: requestPayload
      }, user?.name || user?.email || 'Customer');
    }

    if (onRequestSubmitted) {
      onRequestSubmitted(requestPayload);
    }

    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[110] flex items-center justify-center p-3 sm:p-5 font-inter animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-zinc-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-start justify-between bg-zinc-50/70">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center text-blue-600 shrink-0 font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-zinc-900 text-base sm:text-lg">
                  Promoter Fund Assistance
                </h3>
                {currentStatus !== 'Not Requested' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    Status: {currentStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Connect with funding partners, quasi-equity lenders, and structured co-investors.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-zinc-900">Assistance Request Submitted</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Your request for arranging promoter contribution of ₹ {formData.requiredAmountCr} Cr has been received. Our syndication advisory desk will review and contact you via {formData.preferredContactMethod}.
              </p>
            </div>
            <div className="text-[11px] text-zinc-400 font-medium pt-2">
              Closing window...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
            
            {/* Advisory Info Banner */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1 text-zinc-700">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Need Support for Promoter Contribution?</span>
              </div>
              <p className="text-[11px] text-blue-950/80 leading-relaxed">
                Promoter contribution is an important part of project funding. If you need support in arranging your promoter fund, Inisio can help connect you with suitable funding assistance options (quasi-equity, co-sponsors, NBFC subordinate debt).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Project Name */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="Enter project name"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Required Promoter Contribution Amount */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Required Promoter Contribution (₹ Cr) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.requiredAmountCr}
                    onChange={(e) => setFormData({ ...formData, requiredAmountCr: e.target.value })}
                    placeholder="e.g. 2.50"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  Amount needed to bridge promoter equity
                </span>
              </div>

              {/* Total Project Cost */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Total Project Cost (₹ Cr)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalCostCr}
                    onChange={(e) => setFormData({ ...formData, totalCostCr: e.target.value })}
                    placeholder="e.g. 10.00"
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Funding Requirement */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Bank Funding Requirement (₹ Cr)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-blue-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fundingReqCr}
                    onChange={(e) => setFormData({ ...formData, fundingReqCr: e.target.value })}
                    placeholder="e.g. 7.50"
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-blue-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Preferred Contact Method <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="WhatsApp">WhatsApp Message / Call</option>
                  <option value="Phone">Direct Phone Call</option>
                  <option value="Email">Official Email Communication</option>
                  <option value="In-Person Consultation">In-Person / Virtual CA Advisory Session</option>
                </select>
              </div>

              {/* Promoter Name */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Promoter / Representative Name"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Promoter Mobile */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  value={formData.customerMobile}
                  onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Additional Notes */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Additional Notes / Current Fund Arrangement Status
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Share details on available personal capital, land value ready to pledge, expected co-investor participation, or timeframe..."
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* MANDATORY DISCLAIMER */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-600 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>Advisory Disclaimer</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Promoter fund assistance is a facilitation service. Funding availability depends on eligibility, investor/lender requirements, and applicable terms. Inisio does not guarantee equity syndication or loan approval.
              </p>
            </div>

            {/* Form Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 font-semibold text-xs rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Assistance Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
