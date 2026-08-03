import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface BankPartner {
  id: string;
  name: string;
  logoUrl: string;
  fallbackSvg: React.ReactNode;
}

const BANK_PARTNERS: BankPartner[] = [
  {
    id: 'sbi',
    name: 'State Bank of India',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/State_Bank_of_India_logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 180 40" className="h-8 w-auto">
        <circle cx="16" cy="20" r="14" fill="#002D62" />
        <circle cx="16" cy="20" r="5" fill="#00B1EC" />
        <rect x="14" y="20" width="4" height="14" fill="#FFFFFF" />
        <text x="40" y="26" fill="#002D62" fontSize="14" fontWeight="800" fontFamily="Manrope, sans-serif">
          State Bank of India
        </text>
      </svg>
    )
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 w-auto">
        <rect x="0" y="4" width="32" height="32" fill="#004B8D" rx="2" />
        <rect x="6" y="10" width="20" height="20" fill="#E31837" />
        <rect x="11" y="4" width="10" height="32" fill="#FFFFFF" />
        <rect x="0" y="15" width="32" height="10" fill="#FFFFFF" />
        <rect x="11" y="15" width="10" height="10" fill="#004B8D" />
        <text x="42" y="26" fill="#004B8D" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          HDFC BANK
        </text>
      </svg>
    )
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 w-auto">
        <circle cx="12" cy="12" r="4" fill="#F37021" />
        <path d="M6 30 C6 18, 18 18, 18 30 Z" fill="#003D79" />
        <path d="M2 24 L22 24 L22 28 L2 28 Z" fill="#F37021" />
        <text x="32" y="26" fill="#003D79" fontSize="17" fontWeight="900" fontFamily="Manrope, sans-serif">
          ICICI<tspan fill="#F37021"> Bank</tspan>
        </text>
      </svg>
    )
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Axis_Bank_logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 150 40" className="h-8 w-auto">
        <path d="M14 4 L28 32 L18 32 L14 18 L10 32 L0 32 Z" fill="#97123A" />
        <text x="36" y="26" fill="#97123A" fontSize="17" fontWeight="900" fontFamily="Manrope, sans-serif">
          AXIS BANK
        </text>
      </svg>
    )
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Bank_of_Baroda_logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 170 40" className="h-8 w-auto">
        <circle cx="15" cy="20" r="14" fill="#F26522" />
        <path d="M15 8 L15 32 M8 20 L22 20" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="38" y="25" fill="#F26522" fontSize="14" fontWeight="900" fontFamily="Manrope, sans-serif">
          Bank of Baroda
        </text>
      </svg>
    )
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Punjab_National_Bank_Logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 180 40" className="h-8 w-auto">
        <circle cx="15" cy="20" r="14" fill="#800000" />
        <circle cx="15" cy="20" r="7" fill="#F3A01C" />
        <text x="38" y="25" fill="#800000" fontSize="13" fontWeight="900" fontFamily="Manrope, sans-serif">
          punjab national bank
        </text>
      </svg>
    )
  },
  {
    id: 'union',
    name: 'Union Bank of India',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Union_Bank_of_India_Logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 170 40" className="h-8 w-auto">
        <path d="M4 8 L4 22 A6 6 0 0 0 16 22 L16 8" fill="none" stroke="#E21936" strokeWidth="4" />
        <path d="M10 8 L10 22 A6 6 0 0 0 22 22 L22 8" fill="none" stroke="#0054A6" strokeWidth="4" />
        <text x="32" y="25" fill="#0054A6" fontSize="14" fontWeight="900" fontFamily="Manrope, sans-serif">
          Union Bank
        </text>
      </svg>
    )
  },
  {
    id: 'idbi',
    name: 'IDBI Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/IDBI_Bank_logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 150 40" className="h-8 w-auto">
        <circle cx="14" cy="20" r="12" fill="#008375" />
        <path d="M14 12 L14 28 M8 20 L20 20" stroke="#FFFFFF" strokeWidth="3" />
        <text x="34" y="26" fill="#008375" fontSize="17" fontWeight="900" fontFamily="Manrope, sans-serif">
          IDBI BANK
        </text>
      </svg>
    )
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Canara_Bank_Logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 w-auto">
        <polygon points="4,28 16,8 28,28" fill="none" stroke="#00A2E8" strokeWidth="3" />
        <polygon points="10,28 20,12 30,28" fill="none" stroke="#FFC20E" strokeWidth="3" />
        <text x="36" y="26" fill="#00A2E8" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          Canara Bank
        </text>
      </svg>
    )
  },
  {
    id: 'sidbi',
    name: 'SIDBI',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Small_Industries_Development_Bank_of_India_logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 140 40" className="h-8 w-auto">
        <path d="M14 28 C14 15, 26 10, 26 5 C18 12, 10 18, 14 28 Z" fill="#1B8A43" />
        <text x="34" y="26" fill="#1B8A43" fontSize="18" fontWeight="900" fontFamily="Manrope, sans-serif">
          SIDBI
        </text>
      </svg>
    )
  },
  {
    id: 'yesbank',
    name: 'YES BANK',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Yes_Bank_Logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 140 40" className="h-8 w-auto">
        <rect x="0" y="6" width="28" height="28" fill="#002D62" rx="3" />
        <path d="M5 18 L12 24 L22 10" fill="none" stroke="#E31B23" strokeWidth="3.5" />
        <text x="36" y="26" fill="#002D62" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          YES <tspan fill="#E31B23">BANK</tspan>
        </text>
      </svg>
    )
  },
  {
    id: 'indusind',
    name: 'IndusInd Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/IndusInd_Bank_logo.svg',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 w-auto">
        <path d="M2 24 Q 12 8, 24 24 Z" fill="#C8102E" />
        <text x="32" y="26" fill="#C8102E" fontSize="15" fontWeight="900" fontFamily="Manrope, sans-serif">
          IndusInd Bank
        </text>
      </svg>
    )
  }
];

// Single Logo Item Component with Image + Fallback
const BankLogoItem: React.FC<{ bank: BankPartner }> = ({ bank }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="h-12 sm:h-14 px-6 sm:px-10 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105 cursor-pointer">
      {!hasError ? (
        <img
          src={bank.logoUrl}
          alt={bank.name}
          onError={() => setHasError(true)}
          className="h-7 sm:h-9 max-w-[140px] sm:max-w-[170px] w-auto object-contain transition-all duration-300 opacity-80 hover:opacity-100 grayscale hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-7 sm:h-9 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
          {bank.fallbackSvg}
        </div>
      )}
    </div>
  );
};

export const BankLogosCarousel: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  // Repeat items for infinite smooth marquee
  const marqueeBanks = [...BANK_PARTNERS, ...BANK_PARTNERS, ...BANK_PARTNERS];

  return (
    <section className="py-10 bg-white border-y border-gray-100 relative overflow-hidden">
      {/* Side Fade Gradients */}
      <div className="absolute top-0 left-0 w-24 sm:w-48 h-full bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 sm:w-48 h-full bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none" />

      {/* Minimal Sub-Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Sanction & Syndication Banking Network</span>
        </div>
      </div>

      {/* Pure Marquee Logo Track */}
      <div
        className="flex w-full overflow-hidden py-2 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          className="flex items-center gap-4 sm:gap-8 shrink-0"
          animate={{ x: isPaused ? undefined : ['0%', '-33.333%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 25,
            ease: 'linear'
          }}
        >
          {marqueeBanks.map((bank, index) => (
            <BankLogoItem key={`${bank.id}-${index}`} bank={bank} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
