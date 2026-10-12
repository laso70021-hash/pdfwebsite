export interface PricingPlan {
  id: 'free' | 'pro' | 'team' | 'business';
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  cadenceNote: string;
  description: string;
  isPopular?: boolean;
  ctaText: string;
  features: string[];
  pdfLimit: number;
  aiLimit: number;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    cadenceNote: 'month',
    description: 'Perfect for getting started with occasional PDF tasks.',
    ctaText: 'Get started',
    features: [
      '3 PDF operations',
      '5 AI queries',
      'Core PDF tools',
      'Personal dashboard',
      'Document processing history',
    ],
    pdfLimit: 3,
    aiLimit: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 12,
    priceAnnual: 10,
    cadenceNote: 'month',
    description: 'Unlock the full potential of professional PDF and AI tools.',
    isPopular: true,
    ctaText: 'Choose Pro',
    features: [
      'Unlimited PDF operations',
      'Advanced AI tools',
      'Batch processing',
      'Priority processing',
      'Secure document history',
      'OCR & photo understanding',
    ],
    pdfLimit: 10000,
    aiLimit: 1000,
  },
  {
    id: 'team',
    name: 'Team',
    priceMonthly: 10,
    priceAnnual: 8,
    cadenceNote: 'user / month',
    description: 'Collaborative workspaces for teams and growing organizations.',
    ctaText: 'Choose Team',
    features: [
      'Everything in Pro',
      'Shared workspace',
      'Team usage analytics',
      'Centralized billing',
      'Team member invitations',
      'Shared document collections',
    ],
    pdfLimit: 50000,
    aiLimit: 5000,
  },
  {
    id: 'business',
    name: 'Business',
    priceMonthly: 0,
    priceAnnual: 0,
    cadenceNote: 'month',
    description: 'Enterprise grade security, custom volume, and dedicated SLA.',
    ctaText: 'Contact sales',
    features: [
      'Custom usage limits',
      'Admin controls',
      'Dedicated support',
      'Custom integrations',
      'Custom SLA & retention',
      'Role-based governance',
    ],
    pdfLimit: 999999,
    aiLimit: 999999,
  },
];

export interface ComparisonFeatureGroup {
  groupName: string;
  features: Array<{
    name: string;
    free: boolean | string;
    pro: boolean | string;
    team: boolean | string;
    business: boolean | string;
  }>;
}

export const COMPARISON_GROUPS: ComparisonFeatureGroup[] = [
  {
    groupName: 'PDF operations',
    features: [
      { name: 'Merge and split', free: false, pro: true, team: true, business: true },
      { name: 'Compress PDF', free: true, pro: true, team: true, business: true },
      { name: 'Convert PDF', free: true, pro: true, team: true, business: true },
      { name: 'Watermark and page tools', free: false, pro: true, team: true, business: true },
      { name: 'OCR', free: false, pro: true, team: true, business: true },
    ],
  },
  {
    groupName: 'AI features',
    features: [
      { name: 'AI PDF Summarizer', free: false, pro: true, team: true, business: true },
      { name: 'Chat with PDF', free: false, pro: true, team: true, business: true },
      { name: 'Extract key points', free: false, pro: true, team: true, business: true },
      { name: 'PDF questions and answers', free: false, pro: true, team: true, business: true },
      { name: 'Batch processing', free: false, pro: false, team: true, business: true },
    ],
  },
  {
    groupName: 'Collaboration & support',
    features: [
      { name: 'Document history', free: true, pro: true, team: true, business: true },
      { name: 'Shared workspace', free: false, pro: false, team: true, business: true },
      { name: 'Team administration', free: false, pro: false, team: true, business: true },
      { name: 'Priority support', free: false, pro: false, team: true, business: true },
    ],
  },
];

export const SECURITY_PILLARS = [
  {
    title: 'Encrypted uploads',
    description: 'Your files are always protected with industry-standard TLS encryption.',
  },
  {
    title: 'Private document storage',
    description: 'Files stored securely in private vaults with strict access tokens.',
  },
  {
    title: 'Secure access controls',
    description: 'Only you and authorized members can view or download documents.',
  },
  {
    title: 'Transparent processing',
    description: 'Real on-device processing and strict zero-logging AI guarantees.',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Can I use Swahivo for free?',
    answer: 'Yes! The Free plan includes 3 successful PDF operations and 5 AI queries per account with zero expiration. No credit card is required to get started.',
  },
  {
    question: 'Can I upgrade to Pro later?',
    answer: 'You can upgrade at any time from your dashboard or pricing page. All your documents, bookmarks, and processing history are seamlessly preserved.',
  },
  {
    question: 'Are my documents private?',
    answer: 'Yes. Core PDF tasks like merge, split, and compress run privately in your browser. When you use AI tools, only the document text is processed through secure, non-training Gemini APIs.',
  },
  {
    question: 'How are AI queries counted?',
    answer: 'Each question, summary, extraction, or multimodal photo analysis counts as 1 AI query. Failed or aborted queries are never charged against your allowance.',
  },
  {
    question: 'How does Team billing work?',
    answer: 'Team plans are billed per user seat per month ($10/seat/mo). You can add or remove team member seats at any time with prorated adjustments.',
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes, you can cancel your subscription at any time directly from the Billing tab in your dashboard with one click. You will retain access until the end of your billing cycle.',
  },
  {
    question: 'Can I delete my documents?',
    answer: 'You have full data sovereignty. You can delete any processed file or entire document history instantly from your dashboard, which permanently purges the record.',
  },
  {
    question: 'What happens when my quota is exhausted?',
    answer: 'When you reach the 3 PDF operations or 5 AI queries limit on the Free plan, you will receive a friendly prompt to upgrade to Pro for unlimited operations.',
  },
];
