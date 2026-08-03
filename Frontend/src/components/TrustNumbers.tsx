import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { TRUST_NUMBERS } from '../data/landingData';
import {
  FileCheck,
  TrendingUp,
  Building2,
  Award,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

interface CounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ end, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = end / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={ref} className="font-manrope font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

export const TrustNumbers: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileCheck':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'Building2':
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case 'Award':
        return <Award className="w-4 h-4 text-blue-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <section className="py-8 sm:py-10 bg-slate-50/50 border-y border-slate-200/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-0.5 rounded-full inline-block border border-blue-200/80">
            Proven Track Record Across Pan-India
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {TRUST_NUMBERS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                  {React.cloneElement(getIcon(item.icon), {
                    className: "w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors"
                  })}
                </div>
              </div>

              <div className="space-y-0.5">
                <AnimatedCounter
                  end={item.value}
                  prefix={item.prefix}
                  suffix={item.suffix}
                />
                <h3 className="font-manrope font-semibold text-slate-800 text-xs tracking-tight">
                  {item.label}
                </h3>
                <p className="text-[11px] text-slate-500 font-inter leading-normal line-clamp-2">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sub-bar with bank accreditation */}
        <div className="mt-8 pt-5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Aligned with PSU & Top Private Bank Credit Committees</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <span>• State Bank of India</span>
            <span>• HDFC Bank</span>
            <span>• Bank of Baroda</span>
            <span>• ICICI Bank</span>
            <span>• Canara Bank</span>
          </div>
        </div>
      </div>
    </section>
  );
};
