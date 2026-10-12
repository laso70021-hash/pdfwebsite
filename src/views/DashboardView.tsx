import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Sparkles,
  Settings,
  CreditCard,
  Layers,
  Download,
  MoreVertical,
  CheckCircle2,
  Crown,
  HardDrive,
  FileCheck,
  ChevronRight,
  X,
  HelpCircle,
  MessageSquare,
  Search,
  Trash2,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string, toolId?: string) => void;
  onOpenPricing: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenPricing }) => {
  const { user, entitlements, documents, deleteDocument } = useAuth();
  const [activeSidebarTab, setActiveSidebarTab] = useState('dashboard');
  const [showAiBanner, setShowAiBanner] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownloadDocument = async (docItem: any) => {
    if (docItem.blobDataUrl) {
      const a = document.createElement('a');
      a.href = docItem.blobDataUrl;
      a.download = docItem.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawText('SWAHIVO PROCESSED DOCUMENT', {
        x: 50,
        y: 780,
        size: 18,
        font,
        color: rgb(0.14, 0.38, 0.92),
      });

      page.drawText(`Document: ${docItem.name}`, { x: 50, y: 740, size: 12, font: regular, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Operation: ${docItem.toolUsed}`, { x: 50, y: 720, size: 12, font: regular, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Date: ${docItem.createdAt}`, { x: 50, y: 700, size: 12, font: regular, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Security Status: Verified & Encrypted with Swahivo`, { x: 50, y: 680, size: 12, font: regular, color: rgb(0.1, 0.6, 0.3) });

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = docItem.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.toolUsed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pdfRemaining = Math.max(0, entitlements.pdfOperationsLimit - entitlements.pdfOperationsUsed);
  const aiRemaining = Math.max(0, entitlements.aiQueriesLimit - entitlements.aiQueriesUsed);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between min-h-[calc(100vh-64px)]">
          <div className="space-y-6">
            {/* Primary Nav Items */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveSidebarTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSidebarTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('documents')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSidebarTab === 'documents'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('history')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSidebarTab === 'history'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => onNavigate('ai-pdf')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-violet-500" />
                <span>AI Conversations</span>
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeSidebarTab === 'settings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* Tools Quicklinks */}
            <div className="pt-4 border-t border-slate-100 space-y-1">
              <div className="px-3.5 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tools
              </div>
              <button
                onClick={() => onNavigate('tools')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <Layers className="w-4 h-4" />
                <span>All Tools</span>
              </button>
              <button
                onClick={() => onNavigate('tool', 'compress')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Compress PDF</span>
              </button>
              <button
                onClick={() => onNavigate('tool', 'image-to-pdf')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Convert PDF</span>
              </button>
              <button
                onClick={() => onNavigate('tool', 'merge')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Merge PDF</span>
              </button>
              <button
                onClick={() => onNavigate('ai-pdf')}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-violet-600 hover:bg-violet-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI PDF</span>
              </button>
            </div>
          </div>

          {/* Upgrade Card in Sidebar */}
          {user?.planId === 'free' && (
            <div className="mt-8 bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2">
                <Crown className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Upgrade to Pro</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                Get unlimited access to all tools and AI features.
              </p>
              <button
                onClick={onOpenPricing}
                className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-display">
                Welcome back, {user?.displayName.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Here's what's happening with your account today.
              </p>
            </div>

            {/* Current Plan Badge Card */}
            <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 capitalize">
                  {user?.planId} Plan
                </div>
                <div className="text-[11px] text-slate-400">
                  {user?.planId === 'free' ? 'Upgrade to Pro for more' : 'Active subscription'}
                </div>
              </div>
              {user?.planId === 'free' && (
                <button
                  onClick={onOpenPricing}
                  className="ml-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>

          {/* 4 Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. PDF Operations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">PDF Operations</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums font-display">
                {entitlements.pdfOperationsUsed} / {entitlements.pdfOperationsLimit >= 1000 ? '∞' : entitlements.pdfOperationsLimit}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (entitlements.pdfOperationsUsed / Math.max(1, entitlements.pdfOperationsLimit)) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {user?.planId === 'free' ? `${pdfRemaining} remaining` : 'Unlimited fair use'}
              </div>
            </div>

            {/* 2. AI Queries */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">AI Queries</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums font-display">
                {entitlements.aiQueriesUsed} / {entitlements.aiQueriesLimit >= 1000 ? '∞' : entitlements.aiQueriesLimit}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-violet-600 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (entitlements.aiQueriesUsed / Math.max(1, entitlements.aiQueriesLimit)) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {user?.planId === 'free' ? `${aiRemaining} remaining` : 'Expanded quota active'}
              </div>
            </div>

            {/* 3. Documents Processed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Documents</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums font-display">
                {documents.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-5">
                Total documents in history
              </div>
            </div>

            {/* 4. Storage Used */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Storage Used</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums font-display">
                24 MB / 1 GB
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '2.4%' }} />
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                976 MB remaining
              </div>
            </div>
          </div>

          {/* AI Banner Prompt */}
          {showAiBanner && (
            <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Unlock the power of AI
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Summarize, chat, extract key points, and reason with your PDF documents.
                  </p>
                  <button
                    onClick={() => onNavigate('ai-pdf')}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Try AI Features</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowAiBanner(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2-Column Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Recent Documents Table */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Recent Documents
                  </h3>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="pb-2.5 font-medium">Name</th>
                      <th className="pb-2.5 font-medium">Tool</th>
                      <th className="pb-2.5 font-medium">Status</th>
                      <th className="pb-2.5 font-medium">Date</th>
                      <th className="pb-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2.5 truncate max-w-xs">
                            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-slate-900 truncate">
                                {doc.name}
                              </div>
                              <div className="text-[11px] text-slate-400 tabular-nums">
                                {(doc.size / (1024 * 1024)).toFixed(1)} MB · PDF
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-slate-600 font-medium whitespace-nowrap">
                          {doc.toolUsed}
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        </td>
                        <td className="py-3 text-slate-500 text-[11px] whitespace-nowrap tabular-nums">
                          {doc.createdAt}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Need Help Strip */}
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Need help?</div>
                    <div className="text-[11px] text-slate-500">
                      Check out our Help Center or contact our support team.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('help')}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    Help Center
                  </button>
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Plan Card & Quick Actions */}
            <div className="lg:col-span-4 space-y-4">
              {/* Plan Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">Your Plan</span>
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900 capitalize">
                    {user?.planId} Plan
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Upgrade anytime to get more features, unlimited operations, and higher limits.
                  </p>
                </div>
                <button
                  onClick={onOpenPricing}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  View Plans
                </button>
              </div>

              {/* Quick Actions List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-slate-900">Quick Actions</div>
                <div className="space-y-2">
                  <button
                    onClick={() => onNavigate('tool', 'merge')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
                        M
                      </div>
                      <span>Merge PDF</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('tool', 'compress')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                        C
                      </div>
                      <span>Compress PDF</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('tool', 'image-to-pdf')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                        I
                      </div>
                      <span>Convert to PDF</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => onNavigate('ai-pdf')}
                    className="w-full p-2.5 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center justify-between text-xs font-semibold text-violet-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span>Chat with PDF</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-violet-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
