import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PricingPlan } from '../data/pricingData';
import { X, CheckCircle, CreditCard, ShieldCheck, Sparkles, Building2, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  plan: PricingPlan | null;
  billingCycle: 'monthly' | 'annual';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  billingCycle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, upgradePlan } = useAuth();
  const [seats, setSeats] = useState(3);
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);

  // Business inquiry fields
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('20-50');
  const [notes, setNotes] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  if (!isOpen || !plan) return null;

  const isBusiness = plan.id === 'business';
  const pricePerUnit = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
  const totalPrice = plan.id === 'team' ? pricePerUnit * seats : pricePerUnit;

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/checkout-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
          seats: plan.id === 'team' ? seats : 1,
          email: user?.email || 'user@example.com',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Upgrade user in context & Firestore
        await upgradePlan(plan.id, billingCycle, plan.id === 'team' ? seats : 1);
        setCompletedReceipt(data);

        // Fire celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBusinessLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.displayName || 'Enterprise Lead',
          email: user?.email || 'enterprise@domain.com',
          company: companyName,
          teamSize,
          message: notes,
        }),
      });

      if (response.ok) {
        setLeadSubmitted(true);
      }
    } catch (e) {
      console.error('Lead error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              S
            </div>
            <span className="font-semibold text-slate-900 text-sm">
              {isBusiness ? 'Contact Enterprise Sales' : `Upgrade to ${plan.name}`}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {completedReceipt ? (
            /* Successful Receipt View */
            <div className="space-y-5 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Payment Verified!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Your account is now activated on the <strong>{completedReceipt.planName}</strong> plan.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Invoice:</span>
                  <span className="font-mono font-medium text-slate-900">{completedReceipt.invoiceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono text-slate-700 truncate max-w-[200px]">{completedReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-slate-900">${completedReceipt.amount}.00 USD</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="text-emerald-600 font-semibold uppercase">Verified</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shadow-blue-500/20"
              >
                Go to Dashboard
              </button>
            </div>
          ) : isBusiness ? (
            /* Business Inquiry Form */
            leadSubmitted ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Enterprise Inquiry Sent</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Our sales engineering team will prepare your custom organization quote and contact you within 24 hours.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleBusinessLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Estimated Users / Seats</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="10-25">10 - 25 members</option>
                    <option value="25-100">25 - 100 members</option>
                    <option value="100-500">100 - 500 members</option>
                    <option value="500+">500+ Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Specific Requirements (Optional)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Custom data retention, on-premise OCR, API integration limits..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Inquiry'}
                </button>
              </form>
            )
          ) : (
            /* Standard Checkout Form */
            <form onSubmit={handleSimulatePayment} className="space-y-5">
              {/* Order Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{plan.name} Plan</div>
                    <div className="text-xs text-slate-500">
                      Billed {billingCycle === 'annual' ? 'annually' : 'monthly'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900 tabular-nums">
                      ${totalPrice}.00
                    </div>
                    <div className="text-[11px] text-slate-500">USD</div>
                  </div>
                </div>

                {/* Team Seat Selector */}
                {plan.id === 'team' && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Team Seats:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSeats(Math.max(2, seats - 1))}
                        className="w-6 h-6 rounded border border-slate-300 bg-white flex items-center justify-center font-bold hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="font-semibold px-2 tabular-nums">{seats} seats</span>
                      <button
                        type="button"
                        onClick={() => setSeats(seats + 1)}
                        className="w-6 h-6 rounded border border-slate-300 bg-white flex items-center justify-center font-bold hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Card Information</span>
                  </span>
                  <span className="text-slate-400 font-normal">Stripe Verified Sandbox</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Expiration</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>256-bit encrypted checkout. Cancel anytime with one click.</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ${totalPrice}.00 USD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
