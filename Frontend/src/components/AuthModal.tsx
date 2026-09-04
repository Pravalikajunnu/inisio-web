import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
  ArrowRight,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileCheck2,
  Headphones
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'signup' | 'forgot-password';
  prefilledEmail?: string;
  prefilledName?: string;
  prefilledPhone?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  prefilledEmail = '',
  prefilledName = '',
  prefilledPhone = ''
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showRolesGuide, setShowRolesGuide] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError('');
      setSuccessMessage('');
      if (prefilledEmail) setEmail(prefilledEmail);
      if (prefilledName) setName(prefilledName);
      if (prefilledPhone) setPhone(prefilledPhone);
    }
  }, [isOpen, initialMode, prefilledEmail, prefilledName, prefilledPhone]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if ((mode === 'signup' || mode === 'login') && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (mode === 'forgot-password') {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const resData = await response.json().catch(() => ({}));
        setLoading(false);
        if (response.ok && resData.success) {
          setSuccessMessage(resData.message || `Password reset instructions sent to ${cleanEmail}.`);
        } else {
          setError(resData.message || 'Unable to process password reset request.');
        }
      } catch (err: any) {
        setLoading(false);
        setError('Network error. Please try again.');
      }
      return;
    }

    // Backend authentication call
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'signup' 
        ? { email: cleanEmail, password, name: name || cleanEmail.split('@')[0], phone, company, role }
        : { email: cleanEmail, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
          name: userData.name || name || 'User',
          company: userData.company || company,
          phone: userData.phone || phone,
          token: userData.token,
        };
        onLoginSuccess(user);
        onClose();
        return;
      } else {
        setError(resData.message || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Unable to connect to the authentication server. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Clean Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 font-inter max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              IN
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 font-manrope">
                {mode === 'login' && 'Sign in to Inisio'}
                {mode === 'signup' && 'Create your account'}
                {mode === 'forgot-password' && 'Reset your password'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'login' && 'Access your loan tracking & project advisory desk'}
                {mode === 'signup' && 'Start your greenfield project finance journey'}
                {mode === 'forgot-password' && 'Enter your email to receive recovery instructions'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher for Sign in / Create Account */}
        {mode !== 'forgot-password' && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Feedback Messages */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Signup Specific Fields */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9848012345"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company Ltd"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Account Role *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    <option value="user">Promoter / Borrower (Project Assessments & DPR)</option>
                    <option value="ca">CA / Financial Auditor (Financial Vetting & TEFR)</option>
                    <option value="prosync">Prosync Advisory Desk (Consultation & Syndication)</option>
                    <option value="admin">Platform Administrator (Full Management)</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field (only for login & signup) */}
            {mode !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setError(''); setSuccessMessage(''); }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to Dashboard'}
                    {mode === 'signup' && 'Register Account'}
                    {mode === 'forgot-password' && 'Send Reset Instructions'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {mode === 'forgot-password' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}
          </form>

          {/* Roles & Permissions Breakdown Collapsible Guide */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRolesGuide(!showRolesGuide)}
              className="w-full flex items-center justify-between text-left py-2 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Roles & Permissions Guide</span>
              </span>
              {showRolesGuide ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {showRolesGuide && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-2.5 animate-in fade-in">
                <div className="flex gap-2 items-start">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Promoter / Borrower:</strong>
                    <p className="text-slate-500">Run Greenfield project assessments, calculate bankability & DSCR, track DPR & CMA preparation, view sanction milestones.</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">CA Auditor Desk:</strong>
                    <p className="text-slate-500">Financial auditing, DSCR & Capex vetting, review means of finance, issue TEFR and CA Clearance Certificates.</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Headphones className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Prosync Advisory Desk:</strong>
                    <p className="text-slate-500">Manage 1-on-1 discovery calls, track borrower notes, update consultation statuses, and liaison with lending institutions.</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Platform Administrator:</strong>
                    <p className="text-slate-500">Complete oversight across all project leads, consultant allocation, audit logs, and master export capabilities.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
