import React, { useState, useEffect } from 'react';
import { LeadRecord, updateLeadRecord } from '../utils/leadStore';
import { X, Save, Edit3, Building, IndianRupee, Layers } from 'lucide-react';
import { AuthUser } from '../types';

interface LeadEditModalProps {
  lead: LeadRecord | null;
  user: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({ lead, user, isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState<Partial<LeadRecord>>({});

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        projectName: lead.projectName || '',
        industry: lead.industry || '',
        status: lead.status || '',
        totalCostCr: lead.totalCostCr || '',
        loanRequiredCr: lead.loanRequiredCr || '',
        assignedTeam: lead.assignedTeam || ''
      });
    }
  }, [lead?.id, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLeadRecord(lead.id, formData, user.name || user.email);
    onSaved();
    onClose();
  };

  const isSuperAdmin = user.role === 'admin3';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Edit Project Details</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Modifying record for {lead.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Project / Implementation Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Industry / Services Sector</label>
              <div className="relative">
                <Layers className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.industry || ''}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {isSuperAdmin && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Total Cost (₹ Cr)</label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={formData.totalCostCr || ''}
                      onChange={(e) => setFormData({ ...formData, totalCostCr: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Loan Req (₹ Cr)</label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={formData.loanRequiredCr || ''}
                      onChange={(e) => setFormData({ ...formData, loanRequiredCr: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Status</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Appraisal">In Appraisal</option>
                  <option value="DPR Ready">DPR Ready</option>
                  <option value="Sanctioned">Sanctioned</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Assigned Team</label>
                <select
                  value={formData.assignedTeam || ''}
                  onChange={(e) => setFormData({ ...formData, assignedTeam: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">Unassigned</option>
                  <option value="Advisory Desk">Advisory Desk</option>
                  <option value="CA Appraisal">CA Appraisal</option>
                  <option value="Syndication">Syndication</option>
                </select>
              </div>
            </div>
            
            {!isSuperAdmin && (
              <p className="text-[10px] text-zinc-500 mt-2 italic bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                Note: Financial modification access is restricted to Admin 3.
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-100 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 font-semibold text-xs rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
