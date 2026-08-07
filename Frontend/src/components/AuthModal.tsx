import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  X,
  ArrowRight,
  Lock,
  Mail
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter a valid email address');
      return;
    }

    let role: UserRole = 'user';
    let name = 'Promoter User';

    // Automatic routing based on login email
    if (cleanEmail === 'admin@gmail.com' || cleanEmail.includes('admin')) {
      role = 'admin';
      name = 'Inisio Admin';
    } else if (cleanEmail === 'ca@gmail.com' || cleanEmail.includes('ca')) {
      role = 'ca';
      name = 'CA Rajesh Sharma';
    } else if (cleanEmail === 'user@gmail.com' || cleanEmail.includes('user')) {
      role = 'user';
      name = 'Vikram Malhotra';
    } else {
      name = cleanEmail.split('@')[0];
    }

    const user: AuthUser = {
      email: cleanEmail,
      role,
      name,
      company: role === 'user' ? 'Industrial Enterprises Ltd' : role === 'ca' ? 'Sharma & Associates CAs' : 'Inisio HQ',
      phone: '+91 98765 43210'
    };

    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full text-slate-900 shadow-2xl relative my-6 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-manrope text-lg font-bold text-white">
                Sign In to Inisio
              </h3>
              <p className="text-xs text-slate-400 font-inter">
                Access your account &amp; project dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 font-inter space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="remember" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

