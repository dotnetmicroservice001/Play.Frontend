export const quests = [
  {
    id: 1,
    title: 'Quest 1: Identity & Roles',
    description: 'Identity signs players in, maintains gil balances, and issues role-aware JWT access tokens.',
    tech: ['OAuth 2.0 PKCE', 'IdentityServer', 'Wallet Claims'],
    icon: 'shield-lock'
  },
  {
    id: 2,
    title: 'Quest 2: Catalog Authority',
    description: 'Catalog publishes item updates that Trading consumes to keep pricing and names in sync.',
    tech: ['Catalog DB', 'Read Models', 'Domain Events'],
    icon: 'collection'
  },
  {
    id: 3,
    title: 'Quest 3: Inventory Control',
    description: 'Inventory handles GrantItems/SubtractItems commands and emits status events for the saga.',
    tech: ['MongoDB', 'Grant/Subtract Commands', 'Single Writer'],
    icon: 'boxes'
  },
  {
    id: 4,
    title: 'Quest 4: Trading SAGA',
    description: 'Trading saga coordinates inventory grants, wallet debits, and pushes live status via SignalR.',
    tech: ['SAGA Orchestration', 'Message Bus', 'MassTransit'],
    icon: 'diagram-3'
  },
  {
    id: 5,
    title: 'Quest 5: Observability & Ops',
    description: 'Telemetry proves every purchase: traces, metrics, and logs align around each correlationId.',
    tech: ['OpenTelemetry', 'Prometheus', 'Jaeger', 'Seq'],
    icon: 'activity'
  }
];
