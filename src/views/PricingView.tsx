import React, { useState } from 'react';
import { PRICING_PLANS, COMPARISON_GROUPS, SECURITY_PILLARS, FAQ_ITEMS, PricingPlan } from '../data/pricingData';
import { Check, Minus, Shield, Lock, Clock, ChevronDown, Sparkles } from 'lucide-react';

interface PricingViewProps {
  onSelectPlan: (plan: PricingPlan, billingCycle: 'monthly' | 'annual') => void;
  onOpenAuth: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onSelectPlan, onOpenAuth }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="bg-gradient-to-b from-sky-50/40 via-white to-white min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
          PDF tools that work for you
        </h1>
        <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          Everything you need to manage documents, powered by AI.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Yearly</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between bg-white rounded-2xl p-7 transition-all duration-200 ${
                  isPopular
                    ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10 ring-1 ring-blue-600'
                    : 'border border-slate-200 shadow-sm hover:border-slate-300'
                }`}
              >
                {/* Most Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">{plan.name}</h3>

                  {/* Price */}
                  <div className="mt-4 mb-2 flex items-baseline gap-1.5">
                    {plan.id === 'business' ? (
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-500 uppercase">USD</span>
                        <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-display tabular-nums">
                          {price.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-6">
                    / {plan.cadenceNote}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onSelectPlan(plan, billingCycle)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
                    }`}
                  >
                    {plan.ctaText}
                  </button>

                  {/* Feature Checklist */}
                  <div className="mt-8 space-y-3.5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 font-display">
          Compare Features Across Plans
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-700">
                <th className="py-4 px-6 font-semibold w-2/5">Feature</th>
                <th className="py-4 px-4 font-semibold text-center w-[15%]">Free</th>
                <th className="py-4 px-4 font-semibold text-center w-[15%] text-blue-600">Pro</th>
                <th className="py-4 px-4 font-semibold text-center w-[15%]">Team</th>
                <th className="py-4 px-4 font-semibold text-center w-[15%]">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_GROUPS.map((group, groupIdx) => (
                <React.Fragment key={groupIdx}>
                  <tr className="bg-slate-50/40">
                    <td colSpan={5} className="py-3 px-6 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      {group.groupName}
                    </td>
                  </tr>
                  {group.features.map((f, fIdx) => (
                    <tr key={fIdx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6 text-slate-800 font-medium">
                        {f.name}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {f.free ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/20">
                        {f.pro ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {f.team ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {f.business ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Built for Secure Document Workflows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center border-t border-slate-200">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 font-display mb-10">
          Built for secure document workflows
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SECURITY_PILLARS.map((p, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                {idx === 0 && <Lock className="w-5 h-5" />}
                {idx === 1 && <Shield className="w-5 h-5" />}
                {idx === 2 && <Shield className="w-5 h-5 text-indigo-600" />}
                {idx === 3 && <Clock className="w-5 h-5" />}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{p.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200">
        <h3 className="text-2xl font-bold text-slate-900 text-center font-display mb-8">
          Frequently asked questions
        </h3>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaqIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 rounded-3xl p-8 md:p-12 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 font-display">
              Your documents, handled smarter.
            </h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Join thousands of users who trust Swahivo for their PDF and AI needs.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            Start for free
          </button>
        </div>
      </div>
    </div>
  );
};
