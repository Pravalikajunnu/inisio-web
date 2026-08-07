import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface BankPartner {
  id: string;
  name: string;
  logoUrl: string;
  domain: string;
  fallbackSvg: React.ReactNode;
}

const BANK_PARTNERS: BankPartner[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    domain: 'hdfcbank.com',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090680/Screenshot_2026-08-07_134323_ykijxm.png',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 md:h-10 w-auto">
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
    domain: 'icicibank.com',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090681/Screenshot_2026-08-07_134337_q9idet.png',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 md:h-10 w-auto">
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
    domain: 'axisbank.com',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090681/Screenshot_2026-08-07_134203_lblk5a.png',
    fallbackSvg: (
      <svg viewBox="0 0 160 40" className="h-8 md:h-10 w-auto">
        <path d="M 12 30 L 22 8 L 32 30 L 24 30 L 22 20 L 18 30 Z" fill="#AE285D" />
        <text x="40" y="26" fill="#AE285D" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          AXIS BANK
        </text>
      </svg>
    )
  },
  {
    id: 'bandhan',
    name: 'Bandhan Bank',
    domain: 'bandhanbank.com',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090681/Screenshot_2026-08-07_134225_etedfs.png',
    fallbackSvg: (
      <svg viewBox="0 0 170 40" className="h-8 md:h-10 w-auto">
        <circle cx="16" cy="20" r="12" fill="#E31B23" />
        <text x="36" y="26" fill="#002D62" fontSize="15" fontWeight="800" fontFamily="Manrope, sans-serif">
          Bandhan Bank
        </text>
      </svg>
    )
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    domain: 'canarabank.com',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090681/Screenshot_2026-08-07_134304_rzpzpw.png',
    fallbackSvg: (
      <svg viewBox="0 0 170 40" className="h-8 md:h-10 w-auto">
        <path d="M 8 28 L 18 10 L 28 28 Z" fill="#019EEC" />
        <text x="36" y="26" fill="#019EEC" fontSize="15" fontWeight="800" fontFamily="Manrope, sans-serif">
          Canara Bank
        </text>
      </svg>
    )
  },
  {
    id: 'citi',
    name: 'Citi Bank',
    domain: 'citibank.co.in',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090681/Screenshot_2026-08-07_134247_pg27ee.png',
    fallbackSvg: (
      <svg viewBox="0 0 150 40" className="h-8 md:h-10 w-auto">
        <path d="M 8 12 Q 20 4 32 12" stroke="#E31B23" strokeWidth="4" fill="none" />
        <text x="8" y="28" fill="#002D62" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          citibank
        </text>
      </svg>
    )
  },
  {
    id: 'indianbank',
    name: 'Indian Bank',
    domain: 'indianbank.in',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090680/Screenshot_2026-08-07_134352_bopbdq.png',
    fallbackSvg: (
      <svg viewBox="0 0 170 40" className="h-8 md:h-10 w-auto">
        <circle cx="16" cy="20" r="12" fill="#F3A01C" />
        <text x="36" y="26" fill="#004B8D" fontSize="15" fontWeight="800" fontFamily="Manrope, sans-serif">
          Indian Bank
        </text>
      </svg>
    )
  },
  {
    id: 'kotak',
    name: 'Kotak Bank',
    domain: 'kotak.com',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090680/Screenshot_2026-08-07_134415_imvmie.png',
    fallbackSvg: (
      <svg viewBox="0 0 150 40" className="h-8 md:h-10 w-auto">
        <circle cx="16" cy="20" r="12" fill="#002D62" />
        <text x="36" y="26" fill="#E31B23" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          kotak
        </text>
      </svg>
    )
  },
  {
    id: 'yesbank',
    name: 'YES Bank',
    domain: 'yesbank.in',
    logoUrl: 'https://res.cloudinary.com/aessymvl/image/upload/v1786090680/Screenshot_2026-08-07_134522_htp6g7.png',
    fallbackSvg: (
      <svg viewBox="0 0 140 40" className="h-8 md:h-10 w-auto">
        <rect x="0" y="6" width="28" height="28" fill="#002D62" rx="3" />
        <path d="M5 18 L12 24 L22 10" fill="none" stroke="#E31B23" strokeWidth="3.5" />
        <text x="36" y="26" fill="#002D62" fontSize="16" fontWeight="900" fontFamily="Manrope, sans-serif">
          YES <tspan fill="#E31B23">BANK</tspan>
        </text>
      </svg>
    )
  }
];

// Single Logo Item Component with Image + Fallback
const BankLogoItem: React.FC<{ bank: BankPartner }> = ({ bank }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="h-12 md:h-16 px-6 md:px-10 flex items-center justify-center shrink-0 transition-all duration-300 hover:scale-105 cursor-pointer">
      {!hasError && bank.logoUrl ? (
        <img
          src={bank.logoUrl}
          alt={bank.name}
          title={bank.name}
          onError={() => setHasError(true)}
          className="h-8 md:h-12 max-w-[160px] md:max-w-[200px] w-auto object-contain opacity-90 hover:opacity-100 transition-all duration-300"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="h-8 md:h-12 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
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
