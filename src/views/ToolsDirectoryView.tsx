import React, { useState } from 'react';
import { ALL_PDF_TOOLS } from '../data/toolsData';
import { Search, Sparkles, ArrowRight, Layers } from 'lucide-react';

interface ToolsDirectoryViewProps {
  onSelectTool: (toolId: string) => void;
  onOpenAi: () => void;
}

export const ToolsDirectoryView: React.FC<ToolsDirectoryViewProps> = ({
  onSelectTool,
  onOpenAi,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredTools = ALL_PDF_TOOLS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Directory Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
          All PDF & AI Tools
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Explore our complete directory of document utilities. Process files securely in your browser with zero latency.
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all 30+ tools..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Tools' },
          { id: 'core', label: 'Core PDF' },
          { id: 'convert', label: 'Convert' },
          { id: 'organize', label: 'Edit & Organize' },
          { id: 'security', label: 'Security & Sign' },
          { id: 'ai', label: 'AI Intelligence' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => (tool.isAi ? onOpenAi() : onSelectTool(tool.id))}
            className="group p-5 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform`}
                >
                  {tool.isAi ? <Sparkles className="w-5 h-5" /> : tool.name.slice(0, 1)}
                </div>
                {tool.isAi && (
                  <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                    AI Powered
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
              <span>Launch tool</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
