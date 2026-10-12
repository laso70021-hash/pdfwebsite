import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  Brain,
  FileText,
  UploadCloud,
  CheckCircle,
  Copy,
  Layers,
  Image as ImageIcon,
  Loader2,
  BookOpen,
  HelpCircle,
  AlertCircle,
  FileQuestion,
  GitCompare,
} from 'lucide-react';

const SAMPLE_INVOICE_TEXT = `SWAHIVO MARKETPLACE LTD
123 Dar es Salaam Road, Nairobi, Kenya
support@swahivo.com | +254 700 123 456

INVOICE NO: INV-2025-00432
Issue Date: Apr 26, 2025
Order No: ORD-2025-00876
Payment Method: Mobile Money (M-Pesa)
Status: Paid

Bill To:
Daniel Msuya (daniel.msuya@example.com)
Dar es Salaam, Tanzania

Seller:
Prime Motors (sales@primemotors.co.tz)
Dar es Salaam, Tanzania

Line Items:
1. Toyota Land Cruiser 300 (2024, Diesel, Automatic SUV)
   Description: Premium SUV with advanced safety features, luxury interior, and powerful performance.
   Qty: 1 | Unit Price: TZS 280,000,000 | Total: TZS 280,000,000

2. All Weather Floor Mats
   Description: Custom fit all weather floor mats for maximum protection.
   Qty: 1 | Unit Price: TZS 250,000 | Total: TZS 250,000

3. Paint Protection Film
   Description: High quality paint protection film for long lasting shine.
   Qty: 1 | Unit Price: TZS 750,000 | Total: TZS 750,000

Financial Summary:
Subtotal: TZS 281,000,000
Discount: - TZS 0
VAT (18%): TZS 50,580,000
Total Amount: TZS 331,580,000

Payment Details:
Status: Paid | Transaction ID: MPESA-7F3A9B2C | Payment Date: Apr 26, 2025 14:32`;

export const AiPdfStudio: React.FC<{ onOpenPricing: () => void }> = ({ onOpenPricing }) => {
  const { consumeAiQuota, canPerformAi, setOpenUpgradeModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'thinking' | 'vision' | 'compare'>('chat');
  const [docText, setDocText] = useState(SAMPLE_INVOICE_TEXT);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Toyota_Vehicle_Invoice.pdf');

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hello! I have loaded your invoice document **Toyota_Vehicle_Invoice.pdf**. You can ask me about prices, tax amounts, line items, buyer info, or request summaries.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Summary / Analysis state
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisType, setAnalysisType] = useState('summarize');

  // Thinking mode state
  const [thinkingQuery, setThinkingQuery] = useState('Analyze all financial liabilities, tax implications, and contract warranty risks in this vehicle purchase agreement.');
  const [thinkingResult, setThinkingResult] = useState('');

  // Multimodal Vision state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('Transcribe and structure all text, tables, and total amounts from this document photo.');
  const [visionResult, setVisionResult] = useState('');

  // Compare state
  const [compareDocB, setCompareDocB] = useState('Original Draft Agreement:\nItem 1: Toyota Land Cruiser 2023 at TZS 250,000,000.\nVAT: 16%.\nDelivery time: 60 days.');
  const [compareResult, setCompareResult] = useState('');

  const [copied, setCopied] = useState(false);

  // Chat Submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    if (!canPerformAi()) {
      setOpenUpgradeModal(true);
      return;
    }

    const query = inputQuery.trim();
    setInputQuery('');
    const newMessages = [...messages, { role: 'user' as const, content: query }];
    setMessages(newMessages);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: docText,
          pdfBase64,
          messages: newMessages,
          query,
        }),
      });

      const data = await response.json();
      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        await consumeAiQuota('Chat with PDF');
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Unable to process document at this time.' },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error communicating with AI server.' },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Summary / Extraction
  const handleRunAnalysis = async (task: string) => {
    if (!canPerformAi()) {
      setOpenUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setAnalysisType(task);

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: docText, pdfBase64, task }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.result);
        await consumeAiQuota(`AI ${task}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Deep Thinking Reasoning
  const handleRunThinking = async () => {
    if (!canPerformAi()) {
      setOpenUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: docText, pdfBase64, query: thinkingQuery }),
      });

      const data = await response.json();
      if (data.success) {
        setThinkingResult(data.analysis);
        await consumeAiQuota('Deep Thinking Reasoning');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Multimodal Photo Analysis
  const handleRunVision = async () => {
    if (!imagePreview) return;
    if (!canPerformAi()) {
      setOpenUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imagePreview, prompt: visionPrompt }),
      });

      const data = await response.json();
      if (data.success) {
        setVisionResult(data.result);
        await consumeAiQuota('Multimodal Photo OCR');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run Compare Documents
  const handleRunCompare = async () => {
    if (!canPerformAi()) {
      setOpenUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docA: docText, docB: compareDocB, docAName: fileName, docBName: 'Draft Agreement' }),
      });

      const data = await response.json();
      if (data.success) {
        setCompareResult(data.comparison);
        await consumeAiQuota('Compare Documents');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      if (file.type.includes('image')) {
        reader.onload = () => {
          setImagePreview(reader.result as string);
          setActiveTab('vision');
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        reader.onload = () => {
          const b64 = reader.result as string;
          setPdfBase64(b64);
          setDocText(`[Uploaded PDF Document: ${file.name} - ${(file.size / 1024).toFixed(1)} KB]\nGemini is processing the native PDF structure, pages, and text.`);
          setMessages([
            {
              role: 'assistant',
              content: `I have loaded your PDF **${file.name}** (${(file.size / 1024).toFixed(1)} KB). You can ask me questions about it, or switch to Summarize, Deep Thinking, or Comparison tabs.`,
            },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          setPdfBase64(null);
          setDocText((reader.result as string) || SAMPLE_INVOICE_TEXT);
          setMessages([
            {
              role: 'assistant',
              content: `I have loaded your document **${file.name}**. What would you like to analyze?`,
            },
          ]);
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Google Gemini Document Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white">
            AI Document Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
            Chat interactively, summarize dense pages, extract tabular metrics, run deep reasoning with Thinking Level High, and transcribe document photos with Gemini 3.1 Pro.
          </p>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Viewer & Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">{fileName}</span>
              </div>
              <label className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0">
                <span>Upload Document</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.csv,.doc,.png,.jpg,.jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Document Text Preview */}
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Document Content / Context
              </label>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                rows={14}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
              <span>{docText.length} characters loaded</span>
              <button
                onClick={() => setDocText(SAMPLE_INVOICE_TEXT)}
                className="text-blue-600 hover:underline"
              >
                Reset to Sample Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Operations & Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Functional Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Chat with PDF</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-violet-500" />
              <span>Summary & Key Points</span>
            </button>
            <button
              onClick={() => setActiveTab('thinking')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'thinking'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-blue-600" />
              <span>Deep Thinking (High)</span>
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'vision'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Photo OCR</span>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'compare'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-amber-600" />
              <span>Compare</span>
            </button>
          </div>

          {/* Tab 1: Chat with PDF */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[520px]">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Conversational Document Reasoning</span>
                <span className="text-slate-400">Model: gemini-3.8-flash</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white font-medium rounded-br-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm border border-slate-200/60'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Analyzing document clauses...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask a question about this document (e.g. What is the total VAT?)"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !inputQuery.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Summary & Key Points */}
          {activeTab === 'summary' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleRunAnalysis('summarize')}
                  disabled={isGenerating}
                  className="p-2.5 bg-slate-50 hover:bg-violet-50 text-slate-800 hover:text-violet-700 border border-slate-200 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Executive Summary
                </button>
                <button
                  onClick={() => handleRunAnalysis('extract_key_points')}
                  disabled={isGenerating}
                  className="p-2.5 bg-slate-50 hover:bg-violet-50 text-slate-800 hover:text-violet-700 border border-slate-200 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Key Points
                </button>
                <button
                  onClick={() => handleRunAnalysis('action_items')}
                  disabled={isGenerating}
                  className="p-2.5 bg-slate-50 hover:bg-violet-50 text-slate-800 hover:text-violet-700 border border-slate-200 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Action Items
                </button>
                <button
                  onClick={() => handleRunAnalysis('qa')}
                  disabled={isGenerating}
                  className="p-2.5 bg-slate-50 hover:bg-violet-50 text-slate-800 hover:text-violet-700 border border-slate-200 rounded-xl text-xs font-semibold text-center transition-colors"
                >
                  Q&A Flashcards
                </button>
              </div>

              {/* Analysis Result Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[340px] relative">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-2 text-xs text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                    <span>Extracting intelligence with Gemini AI...</span>
                  </div>
                ) : analysisResult ? (
                  <>
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                        Generated Analysis
                      </span>
                      <button
                        onClick={() => handleCopy(analysisResult)}
                        className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {analysisResult}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-xs text-slate-400">
                    Click an analysis button above to generate structured insights.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Deep Thinking Mode (High) */}
          {activeTab === 'thinking' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Brain className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Gemini 3.1 Pro Thinking Mode (HIGH):</strong> Engages in extended recursive reasoning to scrutinize complex contracts, financial obligations, tax loopholes, and multi-party commitments.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reasoning Objective
                </label>
                <textarea
                  rows={2}
                  value={thinkingQuery}
                  onChange={(e) => setThinkingQuery(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleRunThinking}
                disabled={isGenerating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                <span>Execute Deep Reasoning</span>
              </button>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[220px]">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-xs text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span>Synthesizing deep reasoning paths...</span>
                  </div>
                ) : thinkingResult ? (
                  <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {thinkingResult}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">
                    Deep reasoning output will appear here.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Multimodal Photo OCR */}
          {activeTab === 'vision' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Gemini 3.1 Pro Vision:</strong> Upload photos of invoices, tax receipts, or handwritten notes for high-accuracy OCR transcription.
                </div>
              </div>

              {imagePreview ? (
                <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-slate-800">Photo Loaded</div>
                    <button
                      onClick={() => setImagePreview(null)}
                      className="text-red-600 hover:underline text-[11px]"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center block cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    Click to upload receipt, invoice, or document photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <button
                onClick={handleRunVision}
                disabled={isGenerating || !imagePreview}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                <span>Transcribe & Extract Photo Data</span>
              </button>

              {visionResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {visionResult}
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Compare Documents */}
          {activeTab === 'compare' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Second Document / Revision Text to Compare
                </label>
                <textarea
                  rows={4}
                  value={compareDocB}
                  onChange={(e) => setCompareDocB(e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleRunCompare}
                disabled={isGenerating}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompare className="w-4 h-4" />}
                <span>Compare Revisions</span>
              </button>

              {compareResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {compareResult}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
