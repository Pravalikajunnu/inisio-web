import React, { useState } from 'react';
import { saveLeadRecord } from '../utils/leadStore';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { MAIN_SECTORS } from '../data/landingData';

export const ContactSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    projectType: '',
    investmentAmount: '',
    loanRequirement: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    saveLeadRecord({
      fullName: formData.fullName || 'Contact Lead',
      mobile: formData.phone || 'N/A',
      email: formData.email || 'N/A',
      projectName: `${formData.projectType || 'Greenfield'} Project Inquiry`,
      industry: formData.projectType || 'General Sector',
      location: 'India',
      totalCostCr: formData.investmentAmount || 'N/A',
      loanRequiredCr: formData.loanRequirement || 'N/A',
      source: 'Contact Form Submitted',
      downloadedPDF: false,
      notes: formData.message
    });

    const text = `*NEW CONTACT & ADVISORY BRIEF* 📩\n\n` +
      `• Name: ${formData.fullName}\n` +
      `• Phone: ${formData.phone}\n` +
      `• Email: ${formData.email}\n` +
      `• Sector/Industry: ${formData.projectType}\n` +
      `• Investment/Capex: ₹ ${formData.investmentAmount} Cr\n` +
      `• Required Loan: ₹ ${formData.loanRequirement} Cr\n` +
      (formData.message ? `• Summary/Notes: ${formData.message}` : '');

    window.open(`https://wa.me/916302026462?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Page Header (Centered) */}
        <div className="text-center max-w-[700px] mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Senior Advisory Desk</span>
          </div>
          <h1 className="font-manrope text-3xl sm:text-[40px] font-bold text-[#111827] leading-[1.2] tracking-tight">
            Book Your Free Advisory Call
          </h1>
          <p className="font-inter text-base sm:text-[18px] text-[#4B5563] leading-[1.6]">
            Discuss your greenfield project feasibility, capital requirements, and bank loan syndication with our senior advisory team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* Left Column: Contact Details (Left Aligned) */}
          <div className="lg:col-span-5 space-y-6 font-inter text-left">
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200/80 space-y-6">
              <h3 className="font-manrope text-lg sm:text-[22px] font-semibold text-[#111827] tracking-tight">
                Inisio Advisory Headquarters
              </h3>

              <div className="space-y-5 text-sm sm:text-base text-[#4B5563]">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#111827] shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#111827] block">Corporate Address</span>
                    <p className="text-[#4B5563] leading-[1.5]">Level 7, Inisio Capital Towers, Financial District, Nanakramguda, Hyderabad, Telangana - 500032</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#111827] shrink-0 mt-0.5">
                    <PhoneCall className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#111827] block">Consultation Helpline</span>
                    <a href="tel:+916302026462" className="text-emerald-700 font-semibold hover:underline">+91 63020 26462</a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#111827] shrink-0 mt-0.5">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#111827] block">Direct Email</span>
                    <a href="mailto:advisory@inisio.in" className="text-[#111827] font-semibold hover:underline">advisory@inisio.in</a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#111827] shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-[#111827] block">Working Hours</span>
                    <p className="text-[#4B5563]">Monday - Saturday | 9:00 AM - 7:00 PM IST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidentiality Guarantee */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-base text-[#111827]">100% Confidential</span>
              </div>
              <p className="text-sm text-[#6B7280]">Strict Non-Disclosure Agreement (NDA) applied for all project briefs.</p>
            </div>
          </div>

          {/* Right Column: Contact Form (Left Aligned Labels & Inputs) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-left">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#111827] font-manrope">Consultation Booked Successfully!</h3>
                <p className="text-base text-[#4B5563] font-inter max-w-md mx-auto leading-[1.5]">
                  Thank you, <strong>{formData.fullName}</strong>. A Senior Greenfield Advisor will review your project brief and reach out within 2 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 text-sm font-semibold text-[#111827] bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer"
                >
                  Submit Another Project Brief
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 font-inter">
                <h3 className="text-lg sm:text-[22px] font-semibold text-[#111827] font-manrope border-b border-gray-100 pb-4">
                  Project Consultation Form
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827] block">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827] block">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827] block">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Project Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827] block">Project Type / Sector *</label>
                    <select
                      required
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value="">Select Industry Sector</option>
                      {MAIN_SECTORS.map((sector) => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Investment Amount */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827] block">Total Project Capex (₹ Cr) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter project budget in Cr"
                      value={formData.investmentAmount}
                      onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {/* Loan Requirement */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#111827] block">Loan Requirement (₹ Cr) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 18 Cr"
                      value={formData.loanRequirement}
                      onChange={(e) => setFormData({ ...formData, loanRequirement: e.target.value })}
                      className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#111827] block">Project Summary / Message</label>
                  <textarea
                    rows={4}
                    placeholder="Enter details about land status, equipment requirements, or funding timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl font-normal text-[#111827] focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  className="w-full py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  <span>Book Free Advisory Call</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
