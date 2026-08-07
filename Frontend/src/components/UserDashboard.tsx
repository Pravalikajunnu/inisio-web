import React from 'react';
import { AuthUser } from '../types';
import {
  User,
  Building2,
  FileText,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  PhoneCall,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface UserDashboardProps {
  user: AuthUser;
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onOpenAssessment,
  onOpenConsultation
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-inter">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              <User className="w-3.5 h-3.5" />
              <span>Promoter &amp; Entrepreneur Portal</span>
            </div>
            <h1 className="font-manrope text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Track your Greenfield project feasibility, DPR generation, bank loan sanction timeline, and CA appraisal progress in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenAssessment}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Evaluate New Project</span>
            </button>
            <button
              onClick={onOpenConsultation}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-blue-400" />
              <span>Book Advisory Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Project Name</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-base font-bold text-slate-900 font-manrope truncate">Bio-Pharma Formulation Plant</p>
          <span className="text-xs text-blue-600 font-medium">Pharma &amp; Life Sciences</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Total Project Cost (Capex)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-manrope">₹ 18.50 Cr</p>
          <span className="text-xs text-emerald-600 font-medium">Debt: ₹ 13.80 Cr | Equity: ₹ 4.70 Cr</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Feasibility Grade</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-blue-600 font-manrope">88/100</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">Grade A+</span>
          </div>
          <span className="text-xs text-slate-500">Bankability: Very High</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>DPR Status</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900 font-manrope">Bank-Ready Ready</span>
          </div>
          <span className="text-xs text-purple-600 font-medium">108 Pages DPR Prepared</span>
        </div>
      </div>

      {/* Main Grid: Application Stage & Document Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8 Cols: Loan Syndication Timeline */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-manrope text-lg font-bold text-slate-900">
                Greenfield Loan Sanction Progress
              </h2>
              <p className="text-xs text-slate-500">
                Target Banks: State Bank of India, Canara Bank, HDFC Bank
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Stage 3 of 5 In Progress
            </span>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">1. Feasibility Assessment &amp; Teaser Generation</h4>
                  <span className="text-xs text-slate-500 font-mono">Completed</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  100% financial model validated with 1.48x DSCR and 3.2 years payback period.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">2. Detailed Project Report (DPR) &amp; CMA Data</h4>
                  <span className="text-xs text-slate-500 font-mono">Completed</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  108-page bank-ready DPR compiled with 10-year projected balance sheet, P&amp;L, and cash flows.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 ring-4 ring-blue-100">
                3
              </div>
              <div className="flex-1 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-900">3. CA Financial Appraisal &amp; TEV Audit</h4>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Active Review</span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  CA Portal reviewing tax exemptions, PLI subsidy eligibility, and promoter equity proof.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start opacity-60">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">4. Bank Credit Committee Sanction</h4>
                  <span className="text-xs text-slate-500 font-mono">Upcoming</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Formal presentation to bank credit appraisal desk for term loan sanction letter.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Quick Downloads & Assigned Experts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Downloadable Project Files */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-manrope text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Project Deliverables</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900">DPR Teaser (Bio-Pharma).pdf</div>
                  <div className="text-[10px] text-slate-500">14 Pages • Bank Teaser</div>
                </div>
                <button
                  onClick={() => alert('Downloading Bio-Pharma Project Teaser...')}
                  className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  PDF
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900">CMA Data &amp; Financial Model.xlsx</div>
                  <div className="text-[10px] text-slate-500">10-Year Projections</div>
                </div>
                <button
                  onClick={() => alert('Downloading Bank CMA Financial Excel Model...')}
                  className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  XLSX
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Advisory Team */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 border border-slate-800">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Assigned Syndication Team</span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
                  RS
                </div>
                <div>
                  <div className="font-bold text-sm text-white">CA Rajesh Sharma</div>
                  <div className="text-xs text-slate-400">Chartered Accountant &amp; Syndication Lead</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Direct Contact:</span>
                <a
                  href="https://wa.me/916302026462"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
