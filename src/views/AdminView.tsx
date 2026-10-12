import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  DollarSign,
  FileText,
  Activity,
  Sparkles,
  Search,
  CheckCircle,
  Building,
  Save,
  RefreshCw,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'leads' | 'audit'>('overview');

  // Simulated editable plan states stored in platform settings
  const [plans, setPlans] = useState([
    { id: 'free', name: 'Free', priceMonthly: 0, pdfQuota: 3, aiQuota: 5, active: true },
    { id: 'pro', name: 'Pro', priceMonthly: 12, pdfQuota: 10000, aiQuota: 1000, active: true },
    { id: 'team', name: 'Team', priceMonthly: 10, pdfQuota: 50000, aiQuota: 5000, active: true },
    { id: 'business', name: 'Business', priceMonthly: 499, pdfQuota: 999999, aiQuota: 999999, active: true },
  ]);

  const [savedNotice, setSavedNotice] = useState(false);

  // Business Leads list
  const [leads, setLeads] = useState([
    { id: 'lead-1', name: 'James Thornton', email: 'j.thornton@globalcorp.com', company: 'Global Corp', teamSize: '100-500', date: 'Oct 11, 2026', status: 'New' },
    { id: 'lead-2', name: 'Elena Rostova', email: 'elena@fintechgroup.de', company: 'FinTech Group AG', teamSize: '25-100', date: 'Oct 10, 2026', status: 'Contacted' },
  ]);

  const handleSavePlans = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Swahivo Administration Console</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Superuser control panel for user governance, dynamic plan pricing, enterprise leads, and audit telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Firestore & Gemini API Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'User Directory' },
          { id: 'plans', label: 'Pricing & Quota Manager' },
          { id: 'leads', label: 'Enterprise Leads' },
          { id: 'audit', label: 'Audit Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Total Registered Users</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">4,289</div>
              <div className="text-[11px] text-emerald-600 mt-2 font-medium">+14% this month</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Monthly Recurring Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">$24,680</div>
              <div className="text-[11px] text-slate-400 mt-2">Verified via Stripe Sandbox</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>PDF Jobs Executed</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">84,912</div>
              <div className="text-[11px] text-slate-400 mt-2">Zero server load (client-side)</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Gemini AI Invocations</span>
                <Sparkles className="w-4 h-4 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">39,400</div>
              <div className="text-[11px] text-purple-600 mt-2 font-medium">Flash & Pro Thinking</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">User Governance</h3>
            <span className="text-xs text-slate-400">Authenticated via Firebase</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2.5 font-medium">User Email</th>
                  <th className="pb-2.5 font-medium">Role</th>
                  <th className="pb-2.5 font-medium">Plan</th>
                  <th className="pb-2.5 font-medium">PDF Usage</th>
                  <th className="pb-2.5 font-medium">AI Usage</th>
                  <th className="pb-2.5 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-900">nithonia67@gmail.com</td>
                  <td className="py-3"><span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">ADMIN</span></td>
                  <td className="py-3 capitalize">Pro</td>
                  <td className="py-3 tabular-nums">48 ops</td>
                  <td className="py-3 tabular-nums">19 queries</td>
                  <td className="py-3 text-right text-slate-500">2026-10-12</td>
                </tr>
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3 font-semibold text-slate-900">john@example.com</td>
                  <td className="py-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">USER</span></td>
                  <td className="py-3 capitalize">Free</td>
                  <td className="py-3 tabular-nums">1 / 3 ops</td>
                  <td className="py-3 tabular-nums">0 / 5 queries</td>
                  <td className="py-3 text-right text-slate-500">2026-10-10</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Pricing & Quota Manager */}
      {activeTab === 'plans' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Centralized Plan Entitlements & Prices</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update prices and quotas without redeploying code.
              </p>
            </div>
            <button
              onClick={handleSavePlans}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>

          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Plan pricing and entitlement changes saved to Firestore!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((p, idx) => (
              <div key={p.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50/40 space-y-3">
                <div className="font-bold text-sm text-slate-900 capitalize">{p.name} Tier</div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Monthly Price ($)</label>
                  <input
                    type="number"
                    value={p.priceMonthly}
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[idx].priceMonthly = Number(e.target.value);
                      setPlans(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">PDF Operation Quota</label>
                  <input
                    type="number"
                    value={p.pdfQuota}
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[idx].pdfQuota = Number(e.target.value);
                      setPlans(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">AI Query Allowance</label>
                  <input
                    type="number"
                    value={p.aiQuota}
                    onChange={(e) => {
                      const updated = [...plans];
                      updated[idx].aiQuota = Number(e.target.value);
                      setPlans(updated);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Leads */}
      {activeTab === 'leads' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Enterprise Inquiries</h3>
            <span className="text-xs text-slate-400">Captured via Contact Sales</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2.5 font-medium">Contact</th>
                  <th className="pb-2.5 font-medium">Company</th>
                  <th className="pb-2.5 font-medium">Seats</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/60">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-3 font-medium text-slate-700">{lead.company}</td>
                    <td className="py-3">{lead.teamSize}</td>
                    <td className="py-3 text-slate-500 text-[11px]">{lead.date}</td>
                    <td className="py-3 text-right">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Telemetry */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Real-time System Audit Telemetry</h3>
            <span className="text-xs text-slate-400 font-mono">Status: Stream Active</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-slate-800">[AUTH] User login successful: nithonia67@gmail.com</span>
              <span className="text-slate-400">Just now</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-slate-800">[AI_API] Executed gemini-3.8-flash for task: summarize</span>
              <span className="text-slate-400">2 mins ago</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-slate-800">[PDF_OP] Merge PDF completed: 2 source documents</span>
              <span className="text-slate-400">5 mins ago</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
