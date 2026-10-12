import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, HelpCircle, CheckCircle, Send } from 'lucide-react';

export const PrivacyView: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
      <ShieldCheck className="w-4 h-4" />
      <span>Security & Sovereignty</span>
    </div>
    <h1 className="text-3xl font-extrabold text-slate-900 font-display">Privacy Policy</h1>
    <p className="text-xs text-slate-500 mt-1 mb-8">Effective date: October 2026</p>

    <div className="prose prose-slate text-xs leading-relaxed space-y-6 text-slate-700">
      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">1. Client-Side Processing by Default</h2>
        <p>
          At Swahivo, your document privacy is paramount. Basic PDF operations including Merge, Split, Rotate, Watermarking, and Page Deletion are processed directly in your client browser using WebAssembly and memory buffers. Your raw document files never touch or reside on our servers during standard PDF operations.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">2. AI Document Processing & Gemini API Guarantees</h2>
        <p>
          When you use Swahivo AI tools (such as AI PDF Summarizer, Chat with PDF, and Document Thinking), only the necessary text snippets or document images are transmitted over TLS 1.3 to our secure backend proxy calling Google Gemini API. Google Cloud does not retain or use customer data submitted via AI Studio or Google Cloud Vertex AI to train foundational machine learning models.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">3. Data Deletion & Sovereign Retention</h2>
        <p>
          You have full right to erasure. Any processing history records or AI conversation archives can be permanently purged directly from your Dashboard settings with immediate effect.
        </p>
      </section>
    </div>
  </div>
);

export const TermsView: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
      <Lock className="w-4 h-4" />
      <span>Legal Agreement</span>
    </div>
    <h1 className="text-3xl font-extrabold text-slate-900 font-display">Terms and Conditions</h1>
    <p className="text-xs text-slate-500 mt-1 mb-8">Last updated: October 2026</p>

    <div className="prose prose-slate text-xs leading-relaxed space-y-6 text-slate-700">
      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">1. Subscription Plans and Entitlements</h2>
        <p>
          Swahivo offers Free (3 PDF operations, 5 AI queries), Pro ($12.00/mo), Team ($10.00/user/mo), and Business plans. Unlimited operations on Pro and Team are subject to standard automated abuse-prevention and automated scraper throttling.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900">2. Acceptable Use</h2>
        <p>
          You agree not to upload copyrighted content without authorization, malicious scripts, illegal materials, or automated scrapers designed to bypass subscription quotas.
        </p>
      </section>
    </div>
  </div>
);

export const HelpContactView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Failed to send contact inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <div className="flex items-center justify-center gap-1.5 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Support & Inquiries</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-display">Help Center & Contact</h1>
        <p className="text-xs text-slate-500 mt-2">
          Have a question about subscriptions, enterprise licenses, or an issue with a document? Send our team a note below.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl mx-auto shadow-sm">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Message Received</h3>
            <p className="text-xs text-slate-500">
              Our engineering support team will respond to your email within 12 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Question about Team Plan"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your inquiry in detail..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

export const SecurityComplianceView: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-16">
    <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">
      <ShieldCheck className="w-4 h-4" />
      <span>Enterprise Trust & Architecture</span>
    </div>
    <h1 className="text-3xl font-extrabold text-slate-900 font-display">Security & Compliance Guarantee</h1>
    <p className="text-xs text-slate-500 mt-1 mb-8">Swahivo Security Architecture — Version 2026.1</p>

    <div className="space-y-8 text-xs leading-relaxed text-slate-700">
      <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-4">
        <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-1">Our Core Security Commitment</h2>
          <p className="text-slate-600">
            Swahivo is engineered on a zero-knowledge, client-side first architecture. Your documents belong exclusively to you. We do not inspect, retain, sell, or use your files or AI prompts to train foundational models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Client-Side PDF Processing</span>
          </div>
          <p className="text-slate-600 text-xs">
            Standard operations such as Merge, Split, Compress, Rotate, and Watermark run purely within your browser's WebAssembly sandbox. Raw document bytes never leave your device.
          </p>
        </div>

        <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>End-to-End TLS 1.3 Encryption</span>
          </div>
          <p className="text-slate-600 text-xs">
            All network communication with our AI proxies is secured with strict Transport Layer Security (TLS 1.3), Perfect Forward Secrecy, and encrypted HTTP/2 multiplexing.
          </p>
        </div>

        <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Enterprise AI Safeguards</span>
          </div>
          <p className="text-slate-600 text-xs">
            AI queries sent via Google Gemini API run under Google Cloud Enterprise terms. Customer document content is not cached long-term and is excluded from AI model training.
          </p>
        </div>

        <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Row-Level Security (RLS)</span>
          </div>
          <p className="text-slate-600 text-xs">
            User records, usage quotas, documents, and team members are strictly isolated by cryptographic Row-Level Security policies in Supabase / PostgreSQL.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h3 className="text-base font-bold text-slate-900 font-display">Compliance Standards & Data Sovereignty</h3>
        <p>
          Swahivo aligns with global privacy frameworks including GDPR (Article 17 Right to Erasure, Article 20 Data Portability) and CCPA. Users can permanently purge their document history, activity logs, and AI conversation memory at any time directly through the User Dashboard.
        </p>
        <p>
          For enterprise organizations requiring dedicated Virtual Private Cloud (VPC) deployments, custom Data Processing Agreements (DPA), or custom data residency zones, contact our enterprise compliance team at <strong>compliance@swahivo.com</strong>.
        </p>
      </div>
    </div>
  </div>
);
