import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  ChevronDown,
  Sparkles,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Layers,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, toolId?: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, signOut } = useAuth();
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
              Swahivo
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {/* Tools Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
              className={`flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-2 ${
                currentView === 'tools' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              <span>Tools</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Popular Operations
                </div>
                <button
                  onClick={() => {
                    onNavigate('tool', 'merge');
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                    M
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Merge PDF</div>
                    <div className="text-xs text-slate-500">Combine multiple files</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onNavigate('tool', 'split');
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                    S
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Split PDF</div>
                    <div className="text-xs text-slate-500">Separate pages or extract</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onNavigate('tool', 'compress');
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                    C
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Compress PDF</div>
                    <div className="text-xs text-slate-500">Reduce document size</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onNavigate('ai-pdf');
                    setToolsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">AI PDF Hub</div>
                    <div className="text-xs text-slate-500">Summarize & chat with PDF</div>
                  </div>
                </button>
                <div className="pt-2 px-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onNavigate('tools');
                      setToolsDropdownOpen(false);
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View all 30+ tools</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('tool', 'compress')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'tool' ? 'text-blue-600' : ''
            }`}
          >
            Compress
          </button>
          <button
            onClick={() => onNavigate('tool', 'image-to-pdf')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Convert
          </button>
          <button
            onClick={() => onNavigate('tool', 'merge')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Merge
          </button>
          <button
            onClick={() => onNavigate('ai-pdf')}
            className={`flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'ai-pdf' ? 'text-violet-600 font-semibold' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>AI PDF</span>
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'pricing' ? 'text-blue-600 font-semibold' : ''
            }`}
          >
            Pricing
          </button>
        </nav>

        {/* Zone 3: Primary Action / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
                  {user.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    {user.planId.toUpperCase()} Plan
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">{user.displayName}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('dashboard');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('team');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-slate-500" />
                    <span>Team Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('pricing');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span>Billing & Plans</span>
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Admin Console</span>
                    </button>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      signOut();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition-colors whitespace-nowrap shrink-0"
              >
                Log in
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all whitespace-nowrap shrink-0"
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('tools');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            All PDF Tools (30+)
          </button>
          <button
            onClick={() => {
              onNavigate('ai-pdf');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-violet-700"
          >
            AI PDF Hub
          </button>
          <button
            onClick={() => {
              onNavigate('pricing');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-700"
          >
            Pricing & Plans
          </button>
          {user && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-blue-600"
            >
              My Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
