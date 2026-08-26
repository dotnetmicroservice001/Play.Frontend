export const quests = [
  {
    id: 1,
    title: 'One Login, Everywhere',
    description: 'Log in once, and that session carries your profile and wallet balance with you across the whole store.',
    tech: ['ASP.NET Core Identity', 'JWT (OAuth 2.0 PKCE)', 'Duende IdentityServer', 'Azure Key Vault'],
    icon: 'shield-lock'
  },
  {
    id: 2,
    title: 'Live Catalog Data',
    description: "Prices and stock update straight from the live catalog, so what you see is what's available right now.",
    tech: ['MongoDB', 'CosmosDb', 'Distributed cache'],
    icon: 'collection'
  },
  {
    id: 3,
    title: 'Safe, Atomic Purchases',
    description: 'Reserving the item and taking the payment happen as a single, all-or-nothing transaction, so your charge and your item always match up.',
    tech: ['Saga State Machine',
      'RabbitMQ', 'Azure Service Bus',
      'Distributed transactions'],
    icon: 'boxes'
  },
  {
    id: 4,
    title: 'Real-Time Status Updates',
    description: 'Order status updates land on your screen the moment they happen, so you can watch your order move in real time.',
    tech: ['SignalR (real-time updates)',
      'OpenTelemetry'],
    icon: 'diagram-3'
  }
];
