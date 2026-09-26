import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, Briefcase, FileCheck2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface InternalPortalLoginProps {
  portalType: 'admin' | 'superadmin' | 'ca' | 'prosync' | 'dpr' | 'staff';
  onLoginSuccess: (user: AuthUser) => void;
  onNavigateHome: () => void;
}

export const InternalPortalLogin: React.FC<InternalPortalLoginProps> = ({
  portalType,
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPortalInfo = () => {
    switch (portalType) {
      case 'admin':
      case 'superadmin':
        return {
          title: 'Executive Admin Operations Desk',
          subtitle: 'System Administrators, Directors & Executive Leadership',
          badge: 'Super Admin & Admin Clearance',
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Shield className="w-6 h-6 text-emerald-600" />,
        };
      case 'ca':
        return {
          title: 'Chartered Accountant Audit Portal',
          subtitle: 'Empaneled CAs, CMA Financial Modelers & Statutory Auditors',
          badge: 'CA / Financial Auditor Clearance',
          badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Briefcase className="w-6 h-6 text-purple-600" />,
        };
      case 'prosync':
        return {
          title: 'Prosync Debt Syndication Desk',
          subtitle: 'Bank Consortium Desk & Institutional Debt Coordinators',
          badge: 'Prosync Banking Desk Clearance',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Briefcase className="w-6 h-6 text-amber-600" />,
        };
      case 'dpr':
        return {
          title: 'DPR & TEV Consultant Portal',
          subtitle: 'Technical Engineers & Detailed Project Report Specialists',
          badge: 'Technical & DPR Consultant Clearance',
          badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: <FileCheck2 className="w-6 h-6 text-blue-600" />,
        };
      default:
        return {
          title: 'Inisio Internal Operations Desk',
          subtitle: 'Authorized Inisio Team Members & Empaneled Partners',
          badge: 'Internal Staff Access',
          badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <Shield className="w-6 h-6 text-blue-600" />,
        };
    }
  };

  const portalInfo = getPortalInfo();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please provide your staff email and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const resData = await response.json().catch(() => ({}));
      setLoading(false);

      if (response.ok && resData.success && resData.data) {
        const userData = resData.data;
        if (userData.token) {
          localStorage.setItem('inisio_auth_token', userData.token);
        }
        const user: AuthUser = {
          email: userData.email,
          role: userData.role as UserRole,
          name: userData.name || 'Staff User',
          company: userData.company,
          phone: userData.phone,
          token: userData.token,
        };
        onLoginSuccess(user);
      } else {
        setError(resData.message || 'Invalid credentials. Please verify your staff email and password.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network connection error. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-900 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner">
            {portalInfo.icon}
          </div>

          <div className="space-y-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${portalInfo.badgeColor}`}>
              <Lock className="w-3 h-3" />
              {portalInfo.badge}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white font-manrope tracking-tight pt-1">
              {portalInfo.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {portalInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>Restricted Area. Authorized internal operations personnel only. All access attempts are securely logged.</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Staff Sign-in Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Staff Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@inisio.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Staff Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating Staff...</span>
              </span>
            ) : (
              <>
                <span>Access Internal Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Back to Public Site */}
        <div className="pt-2 text-center border-t border-slate-900">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs text-slate-400 hover:text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
