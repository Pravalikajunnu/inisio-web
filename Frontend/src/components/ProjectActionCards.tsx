import React from 'react';

interface ProjectActionCardsProps {
  onOpenAssessment: () => void;
  onOpenConsultation: () => void;
}

export const ProjectActionCards: React.FC<ProjectActionCardsProps> = ({
  onOpenAssessment,
  onOpenConsultation
}) => {
  return (
    <section className="py-6 sm:py-10 bg-gradient-to-b from-white via-slate-50/40 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-14 max-w-3xl mx-auto items-center">
          
          {/* Card 1: Check Your Project Image */}
          <div
            onClick={onOpenAssessment}
            className="group cursor-pointer rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white border border-slate-200/80 max-w-[320px] mx-auto w-full"
          >
            <img
              src="https://res.cloudinary.com/aessymvl/image/upload/v1786723928/WhatsApp_Image_2026-08-14_at_9.41.08_PM_qb41zh.jpg"
              alt="Check Your Project"
              className="w-full h-auto object-contain block group-hover:scale-[1.01] transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Card 2: Get Your Project Loan Image */}
          <div
            onClick={onOpenConsultation}
            className="group cursor-pointer rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white border border-slate-200/80 max-w-[320px] mx-auto w-full"
          >
            <img
              src="https://res.cloudinary.com/aessymvl/image/upload/v1786723927/WhatsApp_Image_2026-08-14_at_9.41.14_PM_m1cokg.jpg"
              alt="Get Your Project Loan"
              className="w-full h-auto object-contain block group-hover:scale-[1.01] transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </div>
    </section>
  );
};
