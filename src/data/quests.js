export const quests = [
  {
    id: 1,
    title: 'Secure Sign-In',
    description: 'Users sign in through a central identity service, which issues a token that every service verifies.',
    tech: ['ASP.NET Core Identity', 'JWT (OAuth 2.0 PKCE)', 'Duende IdentityServer', 'Azure Key Vault'],
    icon: 'shield-lock'
  },
  {
    id: 2,
    title: 'Live Catalog',
    description: 'Prices and stock levels come directly from the catalog service, so listings are always current.',
    tech: ['MongoDB', 'Cosmos DB', 'Distributed cache'],
    icon: 'collection'
  },
  {
    id: 3,
    title: 'Atomic Purchases',
    description: 'Reserving an item and taking payment complete as one transaction. If either step fails, neither is applied.',
    tech: ['Saga State Machine',
      'RabbitMQ', 'Azure Service Bus',
      'Distributed transactions'],
    icon: 'boxes'
  },
  {
    id: 4,
    title: 'Real-Time Order Status',
    description: "Status changes are pushed to the user's screen the moment they happen.",
    tech: ['SignalR',
      'OpenTelemetry'],
    icon: 'diagram-3'
  }
];
