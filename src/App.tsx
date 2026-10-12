import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { PricingView } from './views/PricingView';
import { ToolsDirectoryView } from './views/ToolsDirectoryView';
import { PdfToolWorkspace } from './components/PdfToolWorkspace';
import { AiPdfStudio } from './components/AiPdfStudio';
import { DashboardView } from './views/DashboardView';
import { TeamWorkspaceView } from './views/TeamWorkspaceView';
import { AdminView } from './views/AdminView';
import { PrivacyView, TermsView, HelpContactView, SecurityComplianceView } from './views/LegalViews';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { PricingPlan, PRICING_PLANS } from './data/pricingData';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedToolId, setSelectedToolId] = useState<string>('merge');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { user, openUpgradeModal, setOpenUpgradeModal } = useAuth();

  const handleNavigate = (view: string, toolId?: string) => {
    if (toolId) {
      setSelectedToolId(toolId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPlan = (plan: PricingPlan, cycle: 'monthly' | 'annual') => {
    if (plan.id === 'free') {
      if (!user) {
        setIsAuthOpen(true);
      } else {
        handleNavigate('dashboard');
      }
      return;
    }
    setSelectedPlan(plan);
    setBillingCycle(cycle);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenPricing={() => handleNavigate('pricing')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'pricing' && (
          <PricingView
            onSelectPlan={handleSelectPlan}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'tools' && (
          <ToolsDirectoryView
            onSelectTool={(toolId) => handleNavigate('tool', toolId)}
            onOpenAi={() => handleNavigate('ai-pdf')}
          />
        )}

        {currentView === 'tool' && (
          <PdfToolWorkspace
            toolId={selectedToolId}
            onBack={() => handleNavigate('tools')}
            onOpenPricing={() => handleNavigate('pricing')}
          />
        )}

        {currentView === 'ai-pdf' && (
          <AiPdfStudio
            onOpenPricing={() => handleNavigate('pricing')}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenPricing={() => handleNavigate('pricing')}
          />
        )}

        {currentView === 'team' && (
          <TeamWorkspaceView
            onOpenPricing={() => handleNavigate('pricing')}
          />
        )}

        {currentView === 'admin' && <AdminView />}

        {currentView === 'privacy' && <PrivacyView />}
        {currentView === 'terms' && <TermsView />}
        {currentView === 'security' && <SecurityComplianceView />}
        {(currentView === 'help' || currentView === 'contact') && <HelpContactView />}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Stripe Sandbox Checkout Modal */}
      <CheckoutModal
        plan={selectedPlan || PRICING_PLANS[1]}
        billingCycle={billingCycle}
        isOpen={isCheckoutOpen || openUpgradeModal}
        onClose={() => {
          setIsCheckoutOpen(false);
          setOpenUpgradeModal(false);
        }}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setOpenUpgradeModal(false);
          handleNavigate('dashboard');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
