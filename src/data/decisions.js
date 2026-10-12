// The three engineering decisions that shape the system, each with why it was
// made and what it costs. Kept general; the purchase saga section shows the
// second one in detail.
export const decisions = [
  {
    title: 'Database per service',
    why: 'Each service has its own database and keeps local copies of other services\' data, updated by events. One service can be redeployed or go down without the others.',
    tradeoff: 'Eventual consistency: local read models lag the source by event latency, and there are no cross-service joins or transactions.',
  },
  {
    title: 'Orchestrated sagas',
    why: 'A purchase touches three services. Trading coordinates it with messages and undoes the earlier steps if a later one fails.',
    tradeoff: 'The outbox is in-memory, so a crash between persisting and sending can strand a saga; a transactional outbox would close that gap.',
    link: { href: '#purchase-saga', label: 'See the purchase saga' },
  },
  {
    title: 'Idempotent consumers',
    why: 'The broker can deliver the same message twice, so each handler remembers what it has processed and skips repeats.',
    tradeoff: 'Every consumer must persist processed message IDs and check them atomically with its write.',
  },
];
