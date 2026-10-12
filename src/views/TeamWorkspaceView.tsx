import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  FileText,
  BarChart3,
  Trash2,
  CheckCircle,
  Plus,
  Crown,
} from 'lucide-react';

interface TeamWorkspaceViewProps {
  onOpenPricing: () => void;
}

export const TeamWorkspaceView: React.FC<TeamWorkspaceViewProps> = ({ onOpenPricing }) => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [members, setMembers] = useState([
    { email: user?.email || 'admin@swahivo.com', name: user?.displayName || 'Daniel Msuya', role: 'admin', status: 'active', joined: 'Apr 2025' },
    { email: 'sarah.k@acme.org', name: 'Sarah Kim', role: 'editor', status: 'active', joined: 'May 2025' },
    { email: 'alex.m@acme.org', name: 'Alex Mwangi', role: 'viewer', status: 'pending', joined: 'Jun 2025' },
  ]);

  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setMembers([
      ...members,
      {
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        role: inviteRole,
        status: 'pending',
        joined: 'Just now',
      },
    ]);
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 3000);
  };

  const removeMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 font-display">Acme Document Workspace</h1>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Team Tier
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your team seats, shared PDF archives, pooled AI tokens, and member permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="font-semibold text-slate-700">{members.length} of 5 seats used</div>
            <div className="text-slate-400">Pooled billing active</div>
          </div>
          <button
            onClick={onOpenPricing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Add Seats
          </button>
        </div>
      </div>

      {/* Team Quota Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Shared PDF Operations</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
            1,420 / 50,000
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '2.8%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Pooled Gemini AI Queries</span>
            <BarChart3 className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
            380 / 5,000
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-violet-600 h-1.5 rounded-full" style={{ width: '7.6%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Team Workspace Storage</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-display tabular-nums">
            18.2 GB / 100 GB
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '18.2%' }} />
          </div>
        </div>
      </div>

      {/* Member Management & Invitation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Member List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-sm font-bold text-slate-900">Workspace Members ({members.length})</div>
            <span className="text-xs text-slate-400">Role-based Access Control</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-2.5 font-medium">User</th>
                  <th className="pb-2.5 font-medium">Role</th>
                  <th className="pb-2.5 font-medium">Status</th>
                  <th className="pb-2.5 font-medium">Joined</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.email}</div>
                    </td>
                    <td className="py-3 capitalize">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        m.role === 'admin'
                          ? 'bg-purple-50 text-purple-700'
                          : m.role === 'editor'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">{m.joined}</td>
                    <td className="py-3 text-right">
                      {m.role !== 'admin' && (
                        <button
                          onClick={() => removeMember(m.email)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          title="Revoke access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Invite Form */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Invite Team Member</span>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@acme.org"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Access Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="editor">Editor (Can process & chat)</option>
                <option value="viewer">Viewer (Read & download only)</option>
                <option value="admin">Admin (Manage members & billing)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Invitation</span>
            </button>

            {inviteSuccess && (
              <div className="text-xs text-emerald-600 text-center flex items-center justify-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Invitation sent successfully!</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
