import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Share2,
  CheckCircle2,
  Building2,
  Sparkles,
  ChevronRight,
  Calculator,
  MessageSquare,
  User,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Award,
  Search,
  ArrowLeft,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';
import { BLOG_POSTS, BlogPost, getBlogPostBySlug } from '../data/blogPosts';

interface BlogsPageProps {
  activeSlug?: string;
  onOpenAssessment: (defaultIndustry?: string) => void;
  onOpenConsultation: () => void;
  onSelectBlog?: (slug: string) => void;
  onBackToBlogs?: () => void;
  onNavigateHome?: () => void;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({
  activeSlug,
  onOpenAssessment,
  onOpenConsultation,
  onSelectBlog,
  onBackToBlogs,
  onNavigateHome
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);

  // Synchronize post from activeSlug or direct deep link
  useEffect(() => {
    if (activeSlug) {
      const found = getBlogPostBySlug(activeSlug);
      if (found) {
        setCurrentPost(found);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setCurrentPost(null);
  }, [activeSlug]);

  const categories = [
    'All',
    'Food Processing & MSME',
    'Debt Syndication',
    'DPR & Advisory',
    'Financial Checklist',
    'Credit Underwriting',
    'Corporate Finance',
    'Government Schemes'
  ];

  const filteredBlogs = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.targetKeywords && post.targetKeywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = BLOG_POSTS[0]; // Lead featured post: Spice Processing Unit guide

  const handlePostClick = (post: BlogPost) => {
    setCurrentPost(post);
    if (onSelectBlog) {
      onSelectBlog(post.slug);
    } else {
      window.history.pushState({}, '', `/blogs/${post.slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentPost(null);
    if (onBackToBlogs) {
      onBackToBlogs();
    } else {
      window.history.pushState({}, '', '/blogs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = (title: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Read this comprehensive project finance guide on Inisio: "${title}" - `);
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
  };

  const handleShareLinkedIn = (title: string) => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareTwitter = (title: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Project Bankability & Funding Guide: ${title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* If Viewing a Single Full-Screen Blog Post */}
      {currentPost ? (
        <div className="w-full">
          {/* Top Bar Navigation */}
          <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-20 shadow-xs">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200 shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Blogs</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
                  title="Copy link"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleShareWhatsApp(currentPost.title)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                >
                  WhatsApp
                </button>

                <button
                  onClick={() => handleShareLinkedIn(currentPost.title)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                >
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* Article Container */}
          <article className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            
            {/* Breadcrumb Navigation */}
            <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 font-medium">
              <button
                onClick={() => onNavigateHome ? onNavigateHome() : (window.location.pathname = '/')}
                className="hover:text-blue-600 transition-colors"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button onClick={handleBack} className="hover:text-blue-600 transition-colors">
                Advisory Blogs
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-blue-600 font-semibold">{currentPost.category}</span>
            </nav>

            {/* Title & Metadata */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
                  {currentPost.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{currentPost.date}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{currentPost.readTime}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.25]">
                {currentPost.title}
              </h1>

              {/* Author & Review Desk Card */}
              <div className="flex items-center gap-3.5 pt-3 pb-2 border-y border-slate-200">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{currentPost.author.name}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{currentPost.author.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-2xl overflow-hidden mb-10 shadow-lg border border-slate-200 aspect-video max-h-[460px] bg-slate-900">
              <img
                src={currentPost.image}
                alt={currentPost.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
                <p className="text-white/95 text-sm sm:text-base font-medium max-w-2xl drop-shadow-md">
                  {currentPost.summary}
                </p>
              </div>
            </div>

            {/* Executive Intro Box */}
            <div className="bg-blue-50/70 border-l-4 border-blue-600 p-6 sm:p-8 rounded-r-2xl mb-12 shadow-xs">
              <h3 className="text-base font-bold text-blue-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Executive Advisory Overview
              </h3>
              <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
                {currentPost.content.intro}
              </p>
            </div>

            {/* Article Body Sections */}
            <div className="space-y-12 text-slate-800">
              {currentPost.content.sections.map((sec, idx) => (
                <section key={idx} className="space-y-4 pt-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-sm font-extrabold">
                      {idx + 1}
                    </span>
                    {sec.heading}
                  </h2>

                  {sec.subheading && (
                    <h3 className="text-lg font-semibold text-slate-800">
                      {sec.subheading}
                    </h3>
                  )}

                  {typeof sec.body === 'string' && (
                    <p className="text-base sm:text-[17px] text-slate-700 leading-relaxed">
                      {sec.body}
                    </p>
                  )}

                  {/* Bullet Points */}
                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs my-4 space-y-3">
                      {sec.bulletPoints.map((point, pIdx) => {
                        const parts = point.split(':');
                        const hasColon = parts.length > 1;
                        return (
                          <div key={pIdx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm sm:text-base text-slate-700 leading-relaxed">
                              {hasColon ? (
                                <>
                                  <strong className="font-semibold text-slate-900">{parts[0]}:</strong>
                                  <span>{parts.slice(1).join(':')}</span>
                                </>
                              ) : (
                                <span>{point}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Data Table */}
                  {sec.table && (
                    <div className="my-6 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-slate-900 text-white font-semibold">
                            <tr>
                              {sec.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="py-3.5 px-4 sm:px-6 text-xs sm:text-sm tracking-wide">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/80 hover:bg-blue-50/40'}>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`py-3.5 px-4 sm:px-6 text-slate-800 ${
                                      cIdx === 0 ? 'font-semibold text-slate-900' : ''
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Callout Box */}
                  {sec.callout && (
                    <div className="p-4 sm:p-5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base font-medium leading-relaxed">
                        {sec.callout}
                      </p>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Key Takeaways Card */}
            {currentPost.content.keyTakeaways && currentPost.content.keyTakeaways.length > 0 && (
              <div className="mt-14 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">Key Banking & Advisory Takeaways</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Essential rules before filing project loan applications</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
                  {currentPost.content.keyTakeaways.map((takeaway, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                        {takeaway}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* High-Conversion Inisio Assessment Call to Action */}
            <div className="mt-12 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                <TrendingUp className="w-80 h-80" />
              </div>

              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  <Calculator className="w-3.5 h-3.5" />
                  Inisio Project Feasibility Engine
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentPost.ctaText.title}
                </h3>

                <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
                  {currentPost.ctaText.description}
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      if (currentPost.category.includes('Food Processing')) {
                        onOpenAssessment('Spice & Agro Processing');
                      } else {
                        onOpenAssessment();
                      }
                    }}
                    className="px-6 py-3.5 rounded-xl bg-white text-blue-900 font-bold text-sm sm:text-base shadow-lg hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentPost.ctaText.buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onOpenConsultation}
                    className="px-6 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold text-sm sm:text-base border border-blue-400/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Book CA / Advisory Consultation</span>
                  </button>
                </div>

                <p className="text-xs text-blue-200/80 pt-2 italic">
                  * Final loan sanction decisions depend on individual lender credit appraisal, promoter net worth, and collateral adequacy.
                </p>
              </div>
            </div>

            {/* Related Articles */}
            <div className="mt-16 pt-12 border-t border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Related Project Advisory Guides
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {BLOG_POSTS.filter(b => b.id !== currentPost.id).slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => handlePostClick(rel)}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-slate-100">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          {rel.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                          {rel.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span>{rel.readTime}</span>
                        <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                          Read Guide →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </article>
        </div>
      ) : (
        /* Full-Screen Blogs Directory / Hub View */
        <div className="w-full">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
            <div className="max-w-6xl mx-auto space-y-6 text-center">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                <BookOpen className="w-4 h-4" />
                Inisio Knowledge & Research Hub
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
                Project Feasibility, Bank Loans & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">MSME Advisory Guides</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Expert insights, detailed project cost breakdowns, debt syndication playbooks, and bankability checklists curated by Chartered Accountants and senior credit underwriters.
              </p>

              {/* Search & Category Filter Bar */}
              <div className="max-w-2xl mx-auto pt-4">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search guides (e.g., Spice Processing, DPR, DSCR, Loan Checklist)..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm sm:text-base font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-md font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
            
            {/* Category Filter Pills */}
            <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-200/80 mb-10 overflow-x-auto flex items-center gap-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Featured Article Banner (Only on "All" without search, or if matches search) */}
            {selectedCategory === 'All' && !searchQuery && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Featured Advisory Guide
                  </h2>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    Lead Article
                  </span>
                </div>

                <div
                  onClick={() => handlePostClick(featuredPost)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 group"
                >
                  <div className="lg:col-span-6 relative aspect-video lg:aspect-auto h-64 lg:h-full bg-slate-900 overflow-hidden">
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {featuredPost.category}
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {featuredPost.date}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredPost.readTime}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {featuredPost.title}
                      </h3>

                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                        {featuredPost.summary}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-500 block">Project Cost</span>
                          <span className="font-bold text-slate-800">₹50 Lakhs to ₹50 Cr+</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-500 block">Target DSCR</span>
                          <span className="font-bold text-emerald-700">1.5x to 1.7x</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        By {featuredPost.author.name}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                        Read Complete Guide <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {selectedCategory === 'All' ? 'All Advisory Articles' : `${selectedCategory} Articles`}
                  <span className="ml-2 text-sm font-semibold text-slate-500 font-normal">
                    ({filteredBlogs.length} articles)
                  </span>
                </h2>
              </div>

              {filteredBlogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">No articles matched your search</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">
                    Try searching for terms like "Spice", "DPR", "Loan", or select "All" categories.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {filteredBlogs.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post)}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                          {post.category}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {post.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </h3>

                          <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                            {post.summary}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                            {post.author.name}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Read Guide <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Assessment & Consultation Section */}
            <div className="mt-16 bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-left max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase">
                  <Calculator className="w-3.5 h-3.5" />
                  Free Project Feasibility Tool
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Ready to check your project's bank loan eligibility?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Evaluate Capex, subsidy potential, projected DSCR, and debt capacity across 12+ greenfield industries in 3 minutes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => onOpenAssessment()}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenConsultation}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Talk to CA Advisory</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
