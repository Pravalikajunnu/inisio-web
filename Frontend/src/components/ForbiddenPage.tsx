import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Home, UserCheck, Shield, Lock } from 'lucide-react';
import { AuthUser } from '../types';

interface ForbiddenPageProps {
  currentUser: AuthUser | null;
  attemptedDashboard: string;
  onNavigateToAuthorizedDashboard: () => void;
  onNavigateHome: () => void;
  onSwitchAccount: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  currentUser,
  attemptedDashboard,
  onNavigateToAuthorizedDashboard,
  onNavigateHome,
  onSwitchAccount,
}) => {
  const getDashboardDisplayName = (dash: string) => {
    switch (dash) {
      case 'admin-dashboard':
        return 'Executive Admin & Super Admin Desk';
      case 'ca-dashboard':
        return 'Chartered Accountant Audit Desk';
      case 'prosync-dashboard':
        return 'Prosync Debt Syndication Portal';
      case 'dpr-dashboard':
        return 'DPR & TEV Consultant Portal';
      case 'user-dashboard':
        return 'Promoter Project Dashboard';
      default:
        return 'Internal Staff Portal';
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin':
      case 'admin1':
      case 'admin2':
      case 'admin3':
        return 'System Administrator';
      case 'superadmin':
        return 'Super Administrator';
      case 'ca':
        return 'Chartered Accountant';
      case 'prosync':
      case 'prosync_admin':
        return 'Prosync Syndication Partner';
      case 'dpr_consultant':
        return 'DPR Consultant';
      case 'user':
        return 'Project Promoter (Client)';
      default:
        return 'Unverified User';
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50 font-sans">
      <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Shield / Error Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
            403
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            <Lock className="w-3 h-3" /> Access Forbidden
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-manrope tracking-tight">
            Unauthorized Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You do not have the required staff credentials or clearance to access the{' '}
            <strong className="text-slate-900 font-bold">{getDashboardDisplayName(attemptedDashboard)}</strong>.
          </p>
        </div>

        {/* Current Auth Status Card */}
        {currentUser && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Active Account:</span>
              <span className="font-mono text-slate-900 font-bold">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Your Assigned Role:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-bold text-blue-700 bg-blue-50 border border-blue-200">
                <UserCheck className="w-3 h-3" />
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {currentUser ? (
            <button
              type="button"
              onClick={onNavigateToAuthorizedDashboard}
              className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onSwitchAccount}
              className="w-full sm:flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Continue</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Public Home</span>
          </button>
        </div>

        {currentUser && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onSwitchAccount}
              className="text-xs text-slate-500 hover:text-blue-600 font-semibold cursor-pointer underline underline-offset-2"
            >
              Need staff access? Sign out &amp; switch account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
