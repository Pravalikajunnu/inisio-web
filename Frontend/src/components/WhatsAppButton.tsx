import React from 'react';
import { PhoneCall } from 'lucide-react';

export function WhatsAppButton() {
  const phoneNumber = '916302026462';
  const defaultText = encodeURIComponent('Hello Inisio Advisory Team, I would like to inquire about greenfield project feasibility and bankability advisory.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultText}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
      {/* Static Direct Call Icon & Button for 6302026462 */}
      <a
        href="tel:+916302026462"
        aria-label="Call Us +91 63020 26462"
        className="flex items-center gap-2 bg-[#111827] hover:bg-slate-800 text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 transition-all duration-300 hover:scale-105 group font-inter border border-slate-700/80 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
          <PhoneCall className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-xs tracking-wide text-white pr-1">
          Call Us
        </span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-emerald-950/20 hover:shadow-emerald-600/30 transition-all duration-300 hover:scale-105 group font-inter cursor-pointer"
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-5 h-5 fill-current shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.522 5.836L.055 23.513l5.833-1.528A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.932 9.932 0 01-5.067-1.39l-.364-.216-3.762.986.1-3.666-.238-.378A9.948 9.948 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>

        <span className="font-bold text-xs tracking-wide">
          WhatsApp
        </span>
      </a>
    </div>
  );
}
