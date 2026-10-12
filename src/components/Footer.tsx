import React, { useState } from 'react';
import { FileText, ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, toolId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight font-display">
                Swahivo
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Smarter PDFs. Bigger possibilities. Complete AI-powered document suite for modern professionals, teams, and enterprises.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Subscribe to our newsletter
              </div>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="bg-slate-900 border border-slate-800 text-sm rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : 'Subscribe'}
                </button>
              </form>
              {subscribed && (
                <div className="text-xs text-emerald-400 mt-1">Thank you for subscribing!</div>
              )}
            </div>
          </div>

          {/* Tools Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Tools</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-white transition-colors">
                  All Tools (30+)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'compress')} className="hover:text-white transition-colors">
                  Compress PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'image-to-pdf')} className="hover:text-white transition-colors">
                  Convert PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tool', 'merge')} className="hover:text-white transition-colors">
                  Merge PDF
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('ai-pdf')} className="hover:text-white transition-colors text-violet-400">
                  AI PDF Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('team')} className="hover:text-white transition-colors">
                  Team Workspaces
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                  Business & Enterprise
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tools')} className="hover:text-white transition-colors">
                  Embed PDF API
                </button>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('help')} className="hover:text-white transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('security')} className="hover:text-white transition-colors">
                  Security Guarantee
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Swahivo Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-400">
              Privacy
            </button>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-400">
              Terms
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-400">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
