import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';
import { validateIndianMobileNumber } from '../utils/validation';
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
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileCheck2,
  Headphones,
  KeyRound,
  RotateCw,
  Send,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  prefilledEmail?: string;
  prefilledName?: string;
  prefilledPhone?: string;
  initialOtp?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  prefilledEmail = '',
  prefilledName = '',
  prefilledPhone = '',
  initialOtp = ''
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>(initialMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRolesGuide, setShowRolesGuide] = useState(false);

  // Email verification / Reset OTP states
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setError('');
      setSuccessMessage('');
      setIsVerifyingOtp(false);
      setOtpCode(initialOtp || '');
      setNewPassword('');
      setConfirmPassword('');
      setResendCooldown(0);
      if (prefilledEmail) setEmail(prefilledEmail);
      if (prefilledName) setName(prefilledName);
      if (prefilledPhone) setPhone(prefilledPhone);
    }
  }, [isOpen, initialMode, prefilledEmail, prefilledName, prefilledPhone, initialOtp]);

  if (!isOpen) return null;

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanOtp) {
      setError('Please enter the 6-digit verification code');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
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
      } else {
        setError(resData.message || 'Invalid verification code. Please check your email.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error while verifying code. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    setError('');
    setResendingOtp(true);
    try {
      const endpoint = mode === 'reset-password' ? '/api/auth/forgot-password' : '/api/auth/send-verification';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const resData = await response.json().catch(() => ({}));
      setResendingOtp(false);
      if (response.ok && resData.success) {
        setResendCooldown(30);
        setSuccessMessage(resData.message || 'A fresh verification code and reset link have been dispatched to your email.');
      } else {
        setError(resData.message || 'Unable to resend code.');
      }
    } catch (e) {
      setResendingOtp(false);
      setError('Unable to resend code. Please try again.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (!cleanEmail) {
      setError('Please provide your registered email address');
      setLoading(false);
      return;
    }

    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit verification code from your email');
      setLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
          newPassword,
        }),
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
          name: userData.name || 'User',
          company: userData.company,
          phone: userData.phone,
          token: userData.token,
        };
        setSuccessMessage('Password reset successfully! Redirecting to your dashboard...');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 1200);
      } else {
        setError(resData.message || 'Unable to reset password. Please verify your OTP code or request a new reset link.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Network error during password reset. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp) {
      return handleVerifyOtpSubmit(e);
    }
    if (mode === 'reset-password') {
      return handleResetPasswordSubmit(e);
    }

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

    if (mode === 'signup') {
      const phoneValidation = validateIndianMobileNumber(phone);
      if (!phoneValidation.isValid) {
        setError(phoneValidation.error);
        setLoading(false);
        return;
      }
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
          setSuccessMessage(resData.message || `Reset link and verification code have been dispatched to ${cleanEmail}.`);
          setResendCooldown(30);
          // Transition to the Reset Password code entry screen so user can enter the OTP or click the link
          setMode('reset-password');
        } else {
          setError(resData.message || 'Unable to process password reset request. Please check your email.');
        }
      } catch (err: any) {
        setLoading(false);
        setError('Network error while sending reset instructions. Please try again.');
      }
      return;
    }

    // Backend authentication call (Login / Signup)
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

        // Check if user requires email verification
        if (userData.requiresVerification || userData.isVerified === false) {
          setIsVerifyingOtp(true);
          setOtpCode('');
          setResendCooldown(30);
          setSuccessMessage(userData.message || `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox.`);
          return;
        }

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
                {isVerifyingOtp && 'Verify Your Email'}
                {!isVerifyingOtp && mode === 'login' && 'Sign in to Inisio'}
                {!isVerifyingOtp && mode === 'signup' && 'Create your account'}
                {!isVerifyingOtp && mode === 'forgot-password' && 'Reset Your Password'}
                {!isVerifyingOtp && mode === 'reset-password' && 'Set New Password'}
              </h2>
              <p className="text-xs text-slate-500">
                {isVerifyingOtp && 'Enter the 6-digit verification code sent to your inbox'}
                {!isVerifyingOtp && mode === 'login' && 'Access your loan tracking & project advisory desk'}
                {!isVerifyingOtp && mode === 'signup' && 'Start your greenfield project finance journey'}
                {!isVerifyingOtp && mode === 'forgot-password' && 'We will email you a secure direct reset link'}
                {!isVerifyingOtp && mode === 'reset-password' && 'Enter your reset code and choose a new password'}
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
        {!isVerifyingOtp && (
          <div className="px-6 pt-4 shrink-0">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); setIsVerifyingOtp(false); }}
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
                onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); setIsVerifyingOtp(false); }}
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
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>

                {/* Quick Action Button if account does not exist */}
                {(error.toLowerCase().includes('create account') || error.toLowerCase().includes('register') || error.toLowerCase().includes('not found') || error.toLowerCase().includes('no registered account') || error.toLowerCase().includes('no account found')) && mode !== 'signup' && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError('');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Create Account with {email || 'this email'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Action Button if password is incorrect */}
                {(error.toLowerCase().includes('incorrect password') || error.toLowerCase().includes('forgot password')) && mode === 'login' && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Reset Forgotten Password →</span>
                    </button>
                  </div>
                )}

                {/* Quick Action Button if account already exists */}
                {(error.toLowerCase().includes('already') || error.toLowerCase().includes('please sign in') || error.toLowerCase().includes('already registered')) && mode === 'signup' && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setError('');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Sign In with this Email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                      }}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email OTP Verification Mode */}
            {isVerifyingOtp ? (
              <div className="space-y-4">
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-900">
                    <p className="font-semibold">Verification Code Dispatched</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      We sent a 6-digit code via email to <span className="font-bold underline">{email}</span>.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter 6-Digit Verification Code *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={resendingOtp || resendCooldown > 0}
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingOtp && <RotateCw className="w-3 h-3 animate-spin" />}
                    <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <>
                      <span>Verify & Access Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setIsVerifyingOtp(false); setError(''); }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            ) : mode === 'reset-password' ? (
              /* Reset Password Screen (After clicking email link or receiving OTP) */
              <div className="space-y-4">
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-blue-900">
                    <p className="font-semibold">Reset Link &amp; Code Dispatched</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Check your email at <span className="font-bold underline">{email || 'your address'}</span>. Click the link in your email or enter the 6-digit code below:
                    </p>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Email Address *
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

                {/* 6-Digit OTP */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    6-Digit Verification Code *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-center"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password * (Min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Didn't get the email?</span>
                  <button
                    type="button"
                    disabled={resendingOtp || resendCooldown > 0}
                    onClick={handleResendOtp}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingOtp && <RotateCw className="w-3 h-3 animate-spin" />}
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Link & Code'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6 || newPassword.length < 6}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </span>
                  ) : (
                    <>
                      <span>Update Password &amp; Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            ) : mode === 'forgot-password' ? (
              /* Forgot Password Request Form */
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                    <span>Password Reset Link Delivery</span>
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Enter your account's email address below. We'll instantly dispatch a secure direct reset link and a 6-digit authorization code to your inbox.
                  </p>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="promoter@company.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Reset Link...</span>
                    </span>
                  ) : (
                    <>
                      <span>Send Reset Password Link &amp; Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('reset-password'); setError(''); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    Already have a reset code?
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Login & Signup Form */
              <>
                {/* Signup specific fields */}
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name / Authorized Signatory *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Ramesh Chandra"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Company / Entity Name
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="Apex Solar Infra Ltd"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Indian Mobile (10-digits) *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Account Type *
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer font-medium"
                      >
                        <option value="user">Promoter / Borrower (Project Assessments &amp; Bank-Grade DPR)</option>
                        <option value="ca">CA / Financial Auditor (Financial Vetting &amp; TEFR)</option>
                        <option value="prosync">Prosync Advisory Desk (Consultation &amp; Syndication)</option>
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

                {/* Password Field */}
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
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
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
                <span>Roles &amp; Permissions Guide</span>
              </span>
              {showRolesGuide ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {showRolesGuide && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-2.5 animate-in fade-in">
                <div className="flex gap-2 items-start">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Promoter / Borrower:</strong>
                    <p className="text-slate-500">Run Greenfield project assessments, calculate bankability &amp; DSCR, track DPR &amp; CMA preparation, view sanction milestones.</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">CA Auditor Desk:</strong>
                    <p className="text-slate-500">Financial auditing, DSCR &amp; Capex vetting, review means of finance, issue TEFR and CA Clearance Certificates.</p>
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
