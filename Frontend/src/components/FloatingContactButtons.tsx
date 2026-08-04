import React from 'react';
import { PhoneCall } from 'lucide-react';

export const FloatingContactButtons: React.FC = () => {
  const phoneNumber = '916302026462';
  const defaultText = encodeURIComponent(
    'Hello Inisio Advisory Team, I would like to inquire about greenfield project feasibility and bankability advisory.'
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultText}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 pointer-events-auto">
      {/* Phone Call Icon Button */}
      <a
        href={`tel:+${phoneNumber}`}
        title="Call Us (+91 63020 26462)"
        aria-label="Call Inisio Advisory Desk at +91 63020 26462"
        className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-900/30 hover:shadow-blue-600/50 transition-all duration-300 hover:scale-110 cursor-pointer border border-blue-400/30 group"
      >
        <PhoneCall className="w-5 h-5 text-white transition-transform group-hover:rotate-12" />
      </a>

      {/* WhatsApp Icon Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp (+91 63020 26462)"
        aria-label="Chat on WhatsApp with Inisio Advisory Team at +91 63020 26462"
        className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg shadow-emerald-950/30 hover:shadow-emerald-600/50 transition-all duration-300 hover:scale-110 cursor-pointer border border-emerald-400/30 group"
      >
        <svg
          className="w-6 h-6 fill-current text-white transition-transform group-hover:scale-110"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.11 1.522 5.836L.055 23.513l5.833-1.528A11.936 11.936 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.932 9.932 0 01-5.067-1.39l-.364-.216-3.762.986.1-3.666-.238-.378A9.948 9.948 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </a>
    </div>
  );
};
