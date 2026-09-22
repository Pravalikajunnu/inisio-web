import React from 'react';
import {
  CheckCircle2,
  Download,
  Printer,
  X,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  Calendar,
  Sparkles,
  Receipt,
  Share2,
} from 'lucide-react';
import { VerifiedPaymentResult } from '../utils/razorpay';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: VerifiedPaymentResult | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  paymentData,
}) => {
  if (!isOpen || !paymentData) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalAmount = paymentData.amount || 0;
  // Calculate base + 18% GST
  const baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
  const gstAmount = Math.round((totalAmount - baseAmount) * 100) / 100;
  const halfGst = Math.round((gstAmount / 2) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Top Header Banner */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-xl shadow-md">
              i
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-200 font-bold">
                Inisio Greenfield Advisory
              </span>
              <h2 className="text-xl font-black font-manrope">Tax Invoice &amp; Payment Receipt</h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-300/40 rounded-full text-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Payment Verified &amp; Captured (Razorpay Gateway)</span>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Invoice Number</span>
              <span className="font-bold text-slate-900 font-mono">{paymentData.invoiceNumber || 'INV-INISIO-2026-9021'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Date</span>
              <span className="font-bold text-slate-900">{currentDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gateway Ref</span>
              <span className="font-bold text-blue-600 font-mono truncate block" title={paymentData.paymentId}>
                {paymentData.paymentId}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Order ID</span>
              <span className="font-bold text-slate-700 font-mono truncate block" title={paymentData.orderId}>
                {paymentData.orderId}
              </span>
            </div>
          </div>

          {/* Customer & Company Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900 text-sm">Industrial Promoter</p>
              <p className="text-slate-600">{paymentData.userEmail}</p>
              <p className="text-slate-500 text-[11px]">Greenfield Project Desk</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Issued By
              </span>
              <p className="font-bold text-slate-900 text-sm">Inisio Greenfield Consultancy Pvt Ltd</p>
              <p className="text-slate-600">GSTIN: 29AAACI8839K1ZV</p>
              <p className="text-slate-500 text-[11px]">Bangalore &amp; Hyderabad, India</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Purchased Entitlements
            </span>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-3 text-right">Taxable Value</th>
                    <th className="py-2.5 px-3 text-right">GST (18%)</th>
                    <th className="py-2.5 px-4 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        Inisio {paymentData.planName?.toUpperCase() || 'PRO'} Membership
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Unlimited AI Underwriting, 10-Yr Bank CMA Model, &amp; CA Desk Review
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">₹{baseAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">₹{gstAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Total Breakdown Summary */}
              <div className="bg-slate-50/80 p-4 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>CGST (9%)</span>
                  <span className="font-mono">₹{halfGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (9%)</span>
                  <span className="font-mono">₹{halfGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                  <span>Total Paid (Inclusive of all taxes)</span>
                  <span className="font-mono text-blue-600 font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Verification Badges */}
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-[11px] text-blue-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Cryptographically signed &amp; verified via Razorpay HMAC-SHA256 signature</span>
            </div>
            <span className="font-mono text-[10px] text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
              100% Secure
            </span>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Access Your Dashboard</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentReceiptModal;
