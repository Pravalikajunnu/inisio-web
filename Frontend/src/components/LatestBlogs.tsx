import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

export { BLOG_POSTS as SAMPLE_BLOGS };
export type { BlogPost };

interface LatestBlogsProps {
  onOpenAssessment?: () => void;
  onOpenConsultation?: () => void;
  onNavigateToBlogs?: (slug?: string) => void;
}

export const LatestBlogs: React.FC<LatestBlogsProps> = ({
  onOpenAssessment,
  onOpenConsultation,
  onNavigateToBlogs
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleBlogs = showAll ? BLOG_POSTS : BLOG_POSTS.slice(0, 3);

  const handleCardClick = (post: BlogPost) => {
    if (onNavigateToBlogs) {
      onNavigateToBlogs(post.slug);
    } else {
      window.history.pushState({}, '', `/blogs/${post.slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleViewAllClick = () => {
    if (onNavigateToBlogs) {
      onNavigateToBlogs();
    } else {
      window.history.pushState({}, '', '/blogs');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <section id="blogs" className="pt-8 sm:pt-10 pb-12 sm:pb-16 bg-[#FAFCFF] border-t border-slate-100 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
            Advisory Insights &amp; Articles
          </span>
          <h2 className="font-manrope text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Latest Blogs &amp; Project Feasibility Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In-depth guides on project feasibility, bank debt syndication, DPR preparation, MSME subsidies, and financial risk mitigation.
          </p>
        </div>

        {/* Blog Cards Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => handleCardClick(blog)}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer h-full"
            >
              {/* Featured Image */}
              <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
                  {blog.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Date & Read Time */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {blog.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {blog.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-manrope text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {blog.title}
                  </h3>

                  {/* 2-3 Line Description */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {blog.summary}
                  </p>
                </div>

                {/* Read More Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 group-hover:text-blue-800 flex items-center gap-1">
                    Read Full Guide
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600">
                    Inisio Advisory
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Blogs CTA Button */}
        <div className="mt-10 text-center flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleViewAllClick}
            className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore All Advisory Blogs (Full Page)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAll(!showAll)}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{showAll ? 'Show Fewer Cards' : 'Show All Here'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        </div>

      </div>
    </section>
  );
};
