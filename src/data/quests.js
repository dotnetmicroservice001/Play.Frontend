export const quests = [
  {
    id: 1,
    title: 'Step 1: Sign in & sync your profile',
    description: 'Log in once and your player stats and wallet balance follow you anywhere you play.',
    tech: ['ASP.NET Core Identity', 'JWT (OAuth 2.0 PKCE)', 'Duende IdentityServer', 'Azure Key Vault'],
    icon: 'shield-lock'
  },
  {
    id: 2,
    title: 'Step 2: Browse live catalog listings',
    description: 'See accurate prices and availability the moment you open the marketplace.',
    tech: ['MongoDB', 'CosmosDb', 'Distributed cache'],
    icon: 'collection'
  },
  {
    id: 3,
    title: 'Step 3: Confirm your purchase',
    description: 'Reserve items and debit your wallet in under a second—no double charges, no surprises.',
    tech: ['Saga State Machine',
      'RabbitMQ', 'Azure Service Bus',
      'Distributed transactions'],
    icon: 'boxes'
  },
  {
    id: 4,
    title: 'Step 4: Track status in real time',
    description: 'Watch progress updates land instantly—no refresh button required.',
    tech: ['SignalR (real-time updates)',
      'OpenTelemetry'],
    icon: 'diagram-3'
  }
];
