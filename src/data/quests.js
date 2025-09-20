export const quests = [
  {
    id: 1,
    title: 'Step 1: Sign in & sync your profile',
    description: 'Log in once and your player stats and wallet balance follow you anywhere you play.',
    tech: ['IdentityServer secures every session', 'JWT carries your profile and wallet claims'],
    icon: 'shield-lock'
  },
  {
    id: 2,
    title: 'Step 2: Browse live catalog listings',
    description: 'See accurate prices and availability the moment you open the marketplace.',
    tech: ['Catalog service streams item updates', 'Pricing cache keeps totals trustworthy'],
    icon: 'collection'
  },
  {
    id: 3,
    title: 'Step 3: Confirm your purchase',
    description: 'Reserve items and debit your wallet in under a second—no double charges, no surprises.',
    tech: ['Trading saga coordinates inventory and wallet', 'Idempotent commands prevent duplicate runs'],
    icon: 'boxes'
  },
  {
    id: 4,
    title: 'Step 4: Track status in real time',
    description: 'Watch progress updates land instantly—no refresh button required.',
    tech: ['SignalR streams order status to the UI', 'Telemetry traces every hop end-to-end'],
    icon: 'diagram-3'
  }
];
