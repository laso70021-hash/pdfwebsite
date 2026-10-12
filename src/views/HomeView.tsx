import React, { useState, useRef } from 'react';
import { ALL_PDF_TOOLS } from '../data/toolsData';
import {
  UploadCloud,
  CheckCircle,
  Zap,
  Shield,
  Sparkles,
  Smartphone,
  ArrowRight,
  Search,
  Filter,
  FileText,
  ChevronDown,
  Layers,
  Star,
  Building,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string, toolId?: string) => void;
  onOpenPricing: () => void;
  onOpenAuth: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenPricing,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredTools = ALL_PDF_TOOLS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || t.category === selectedCategory || (selectedCategory === 'popular' && t.isPopular);
    return matchesSearch && matchesCategory;
  });

  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Navigate to compress or merge by default
      onNavigate('tool', 'compress');
    }
  };

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Instant Dropzone */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-Powered PDF Tools</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-display leading-[1.1]">
                All-in-One <span className="text-blue-600">PDF</span> Solution for Work, Study & Business
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Edit, convert, compress and manage your PDF files with ease. Powerful Gemini AI tools to help you work smarter and faster.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Fast & Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>No Installation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Works on Any Device</span>
                </div>
              </div>

              {/* Hero Dropzone Card */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-8 text-center bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group max-w-xl shadow-xs"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleQuickUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Drop your PDF here, or click to upload
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Supports PDF, JPG, PNG and more (Max 50MB)
                </div>
                <button
                  type="button"
                  className="mt-4 px-6 py-2.5 bg-blue-600 group-hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Choose File
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Applet Mockup Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 relative z-10 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      S
                    </div>
                    <span className="font-bold text-xs text-slate-900 font-display">Swahivo Suite</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                </div>

                {/* Micro Tool Grid */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    PDF Tools
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <button
                      onClick={() => onNavigate('tool', 'merge')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold mx-auto mb-1">
                        M
                      </div>
                      <span className="font-medium text-slate-700">Merge PDF</span>
                    </button>
                    <button
                      onClick={() => onNavigate('tool', 'split')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold mx-auto mb-1">
                        S
                      </div>
                      <span className="font-medium text-slate-700">Split PDF</span>
                    </button>
                    <button
                      onClick={() => onNavigate('tool', 'compress')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mx-auto mb-1">
                        C
                      </div>
                      <span className="font-medium text-slate-700">Compress</span>
                    </button>
                    <button
                      onClick={() => onNavigate('tool', 'protect')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold mx-auto mb-1">
                        P
                      </div>
                      <span className="font-medium text-slate-700">Protect</span>
                    </button>
                  </div>
                </div>

                {/* AI PDF Micro Grid */}
                <div>
                  <div className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI PDF Tools</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <button
                      onClick={() => onNavigate('ai-pdf')}
                      className="p-2.5 rounded-xl border border-violet-100 bg-violet-50/30 hover:bg-violet-100/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center mx-auto mb-1">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-violet-900">Summarize</span>
                    </button>
                    <button
                      onClick={() => onNavigate('ai-pdf')}
                      className="p-2.5 rounded-xl border border-violet-100 bg-violet-50/30 hover:bg-violet-100/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center mx-auto mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-violet-900">Chat PDF</span>
                    </button>
                    <button
                      onClick={() => onNavigate('ai-pdf')}
                      className="p-2.5 rounded-xl border border-violet-100 bg-violet-50/30 hover:bg-violet-100/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto mb-1">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-violet-900">Key Points</span>
                    </button>
                    <button
                      onClick={() => onNavigate('ai-pdf')}
                      className="p-2.5 rounded-xl border border-violet-100 bg-violet-50/30 hover:bg-violet-100/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center mx-auto mb-1">
                        Q
                      </div>
                      <span className="font-medium text-violet-900">Q&A</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800">Smarter Documents with AI</div>
                  <button
                    onClick={() => onNavigate('ai-pdf')}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Open Studio →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Tools Directory Grid */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Popular Tools
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                Everything You Need for Your PDF
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose from our most popular tools to get started quickly.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools..."
                  className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="popular">Popular Only</option>
                <option value="core">Core PDF</option>
                <option value="convert">Conversions</option>
                <option value="organize">Organize</option>
                <option value="security">Security</option>
                <option value="ai">AI Tools</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTools.slice(0, 12).map((tool) => (
              <div
                key={tool.id}
                onClick={() =>
                  tool.isAi ? onNavigate('ai-pdf') : onNavigate('tool', tool.id)
                }
                className="group p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform`}>
                      {tool.isAi ? <Sparkles className="w-5 h-5" /> : tool.name.slice(0, 1)}
                    </div>
                    {tool.isAi && (
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                        Gemini AI
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-display">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Open tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate('tools')}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>Explore All 30+ PDF Tools</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Why Swahivo: More Than Just PDF Tools */}
      <section className="py-16 bg-slate-50/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Why Swahivo
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              More Than Just PDF Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Swahivo combines powerful PDF processing with advanced AI capabilities to help you get more done, faster.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Lightning Fast</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Process your files in seconds with client-side zero latency execution.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Bank-Level Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your files are private and protected with industry standard encryption.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">AI-Powered</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Leverage Google Gemini AI to summarize, chat, and analyze your documents.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Access Anywhere</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Work seamlessly from any device, anytime, with zero installation needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three-step workflow */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              How It Works
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Get Started in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Upload Your File</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose a file from your device or drag and drop it into the workspace.
              </p>
            </div>

            <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Process with Our Tools</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use our PDF tools or AI features to get your desired result instantly.
              </p>
            </div>

            <div className="p-6 bg-slate-50/60 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Download & Share</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save your file instantly and share it safely with team members. That's it!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics & Social Proof */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 font-display">500,000+</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Documents Processed</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-display">99.99%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Platform Uptime</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-display">4.9 / 5.0</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">User Satisfaction</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-display">0 bytes</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Client Data Retained</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Testimonials */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Customer Stories
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Loved by Professionals and Fast-Growing Teams
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is how Swahivo powers productivity across legal, finance, and technical teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "The Gemini AI integration changed how our paralegals review 80-page contracts. Being able to extract key risks and summarize clauses in seconds saved us at least 15 billable hours a week."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Marcus Rodriguez</div>
                  <div className="text-[11px] text-slate-500">Senior Partner, Rodriguez & Co. Legal</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Having client-side PDF compression and watermarking run without uploading confidential earnings reports to unknown third-party servers was our number one compliance mandate. Swahivo nailed it."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  SL
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sarah Lindqvist</div>
                  <div className="text-[11px] text-slate-500">VP of Finance, Nord Financial Group</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Our design and marketing squad uses Swahivo Team plan for daily client deliverables. The seat management and shared workspace make collaborating on multi-file deck assemblies totally seamless."
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
                  DK
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Devon Kelly</div>
                  <div className="text-[11px] text-slate-500">Head of Operations, Apex Creative Agency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Homepage FAQ Accordion */}
      <section className="py-16 bg-slate-50/60 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Everything you need to know about Swahivo, security, and our plans.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What is included in the Free plan?',
                a: 'The Free plan gives you 3 successful PDF operations and 5 AI queries per account with access to our core PDF tools, personal dashboard, and client-side processing.',
              },
              {
                q: 'How does client-side PDF processing keep my documents safe?',
                a: 'For operations like Merge, Split, Rotate, and Compression, your files are processed directly in your browser memory via WebAssembly. The files are not uploaded to our backend servers, guaranteeing complete privacy.',
              },
              {
                q: 'Which Google Gemini models power the AI features?',
                a: 'Swahivo is powered by Google Gemini 2.5 Flash and Gemini 2.5 Pro models, providing ultra-fast document summarization, context-grounded chat, multimodal OCR extraction, and deep thinking analysis.',
              },
              {
                q: 'Can I cancel or change my subscription at any time?',
                a: 'Yes, absolutely. You can upgrade, downgrade, or cancel your Pro or Team plan anytime with a single click in your account settings. There are no lock-in contracts.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Pricing Teaser */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto mb-8">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              Simple Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
              Choose Your Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Start free or upgrade to Pro for more power, higher limits and premium features.
            </p>
          </div>

          <button
            onClick={onOpenPricing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
          >
            <span>View All Plans & Features</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
