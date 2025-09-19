import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { QuestTimeline } from './QuestTimeline';
import TextType from './TextType';

import '../styles/landing.css';

const tradeTickerItems = [
  'Catalog Item Found',
  'Inventory Item Reserved',
  'Trading Saga Committed',
  'Payment Succeeded',
  'Distributed Traces Exported'
];

const architectureTopEdge = [
  {
    id: 'spa',
    label: 'React SPA',
    support: 'Player portal',
    tooltip: 'Single-page app shows quests and live purchase status after sign-in.'
  },
  {
    id: 'gateway',
    label: 'Ingress / API Gateway',
    support: 'Policy & routing',
    tooltip: 'Gateway terminates TLS, checks auth policies, and forwards traffic to services.'
  },
  {
    id: 'identity',
    label: 'Identity',
    support: 'JWT & profiles',
    tooltip: 'Identity signs players in, keeps profiles, and issues role-aware JWTs.'
  }
];

const architectureContexts = [
  {
    id: 'catalog',
    title: 'Catalog',
    owns: 'Item list & price cache',
    serviceTooltip: 'Builds a read model from catalog events so Trading always has trusted prices.',
    db: { label: 'Catalog DB', tooltip: 'Item descriptions, price points, and availability flags.' }
  },
  {
    id: 'inventory',
    title: 'Inventory',
    owns: 'Player items & grants',
    serviceTooltip: 'Single writer handles GrantItems/SubtractItems commands and emits inventory events.',
    db: { label: 'Inventory DB', tooltip: 'Player holdings plus quantity history.' }
  },
  {
    id: 'trading',
    title: 'Trading',
    owns: 'Purchase saga brain',
    serviceTooltip: 'MassTransit state machine coordinates inventory grants, gil debits, and player notifications.',
    db: { label: 'Saga Store', tooltip: 'Saga state: who bought what, current step, last error.' }
  }
];

const messageBusEvents = [
  { id: 'purchase-requested', label: 'PurchaseRequested', tooltip: 'userId, itemId, quantity, correlationId' },
  { id: 'grant-items', label: 'GrantItems', tooltip: 'userId, catalogItemId, quantity, correlationId' },
  { id: 'inventory-granted', label: 'InventoryItemsGranted', tooltip: 'correlationId' },
  { id: 'debit-gil', label: 'DebitGil', tooltip: 'userId, gil, correlationId' },
  { id: 'gil-debited', label: 'GilDebited', tooltip: 'correlationId' },
  { id: 'subtract-items', label: 'SubtractItems', tooltip: 'userId, catalogItemId, quantity, correlationId' },
  { id: 'inventory-subtracted', label: 'InventoryItemsSubtracted', tooltip: 'correlationId' }
];

const operationsRail = [
  { id: 'otel', label: 'OTel Collector', tooltip: 'Ships traces, metrics, and logs out of process.' },
  { id: 'prometheus', label: 'Prometheus', tooltip: 'Scrapes services, powers events/min, reserve success rate.' },
  { id: 'jaeger', label: 'Jaeger', tooltip: 'Distributed traces; purchase path p95 ≈ 180-220 ms in dev.' },
  { id: 'seq', label: 'Seq', tooltip: 'Structured logs with orderId, playerId, traceId.' }
];

const legendItems = [
  { id: 'legend-http', label: 'Solid line = HTTP (sync)' },
  { id: 'legend-event', label: 'Dashed purple = Event (async)' },
  { id: 'legend-db', label: 'Cylinder = Owned data' }
];

const highlightedNodes = new Set([
  'spa',
  'gateway',
  'identity',
  'catalog',
  'inventory',
  'trading',
  'bus',
  'otel',
  'prometheus',
  'jaeger',
  'seq'
]);

const reasonsToBelieve = [
  'MassTransit saga owns the workflow, not the front end.',
  'Inventory and wallet services emit their own status events.',
  'CorrelationIds and idempotent handlers keep retries safe.'
];

const proofMetrics = [
  '4 core services (Identity, Catalog, Inventory, Trading)',
  '6 saga messages on the bus',
  'SignalR status lands in under a second locally',
  'Prometheus and Jaeger wired in every service' 
];

export const Landing = () => {
  const tickerSequence = [...tradeTickerItems, ...tradeTickerItems];

  return (
    <div className="landing-page" id="top">
      <main>
        <section id="demo" className="landing-hero">
          <Container>
            <div className="landing-hero__content landing-hero__content--stack">
              <div className="landing-hero__eyebrow">Developer Showcase</div>
              <TextType
                as="h1"
                className="hero-typer"
                text={
                  'Welcome to Play Economy.\n' +
                  'Cloud-native, event-driven architecture.\n' +
                  'Identity • Catalog • Inventory • Trading.\n' +
                  'Secure and observable end-to-end.'
                }
                loop={false}
                typingSpeed={90}
                pauseDuration={900}
                showCursor
                hideCursorWhileTyping
                cursorBlinkDuration={0.8}
                cursorCharacter="▍"
              />
              <p className="landing-hero__subtitle">
                Built with secure identity flows, a Trading-led SAGA for purchases, and deep observability.
              </p>
            </div>
          </Container>
        </section>

        <div className="trade-ticker" aria-hidden="true">
          <div className="trade-ticker__inner">
            {tickerSequence.map((item, index) => (
              <span key={`${item}-${index}`} className="trade-ticker__item">
                {item}
              </span>
            ))}
          </div>
        </div>

        <section id="quests" className="landing-section">
          <Container>
            <QuestTimeline />
          </Container>
        </section>

        <section className="landing-section" id="architecture">
          <Container>
            <div className="architecture-map">
              <div className="architecture-map__intro">
                <div className="landing-hero__eyebrow">Architecture Map</div>
                <h2 className="landing-hero__title" style={{ fontSize: '1.7rem' }}>
                  Event-Driven Services at a Glance
                </h2>
                <p className="landing-hero__subtitle">
                  A player clicks buy, Trading drives the saga, inventory and wallet answer via messages, and SignalR
                  feeds the status back to the UI. Hover to meet each part of the story.
                </p>
              </div>

              <div className="architecture-map__overlays">
                <div className="architecture-map__overlay-caption">
                  Trading keeps inventory and wallet aligned with at-least-once messaging and SignalR status updates.
                </div>
              </div>

              <div className="architecture-map__diagram">
                <div className="architecture-map__stack">
                  <div className="architecture-map__top-edge">
                    {architectureTopEdge.map((node, index) => (
                      <div
                        key={node.id}
                        className={`architecture-map__box architecture-map__box--edge ${
                          highlightedNodes.has(node.id) ? 'is-highlighted' : ''
                        }`}
                        data-node={node.id}
                        aria-label={node.label}
                        tabIndex={0}
                      >
                        <span className="architecture-map__box-label">{node.label}</span>
                        {node.support && <span className="architecture-map__box-support">{node.support}</span>}
                        <span className="architecture-map__tooltip">{node.tooltip}</span>
                        {index < architectureTopEdge.length - 1 && <span className="architecture-map__edge-connector" aria-hidden="true"></span>}
                      </div>
                    ))}
                  </div>

                <div className="architecture-map__lanes">
                  {architectureContexts.map((context) => (
                    <div key={context.id} className="architecture-map__lane">
                      <div
                        className={`architecture-map__service ${
                          highlightedNodes.has(context.id) ? 'is-highlighted' : ''
                        }`}
                        data-node={context.id}
                      >
                        <div className="architecture-map__service-header">
                          <span className="architecture-map__lane-title">{context.title}</span>
                            <span className="architecture-map__lane-subtitle">{context.owns}</span>
                          </div>
                          <span className="architecture-map__tooltip">{context.serviceTooltip}</span>
                      </div>
                      <div className="architecture-map__db" data-node={`${context.id}-db`}>
                        <span className="architecture-map__db-label">{context.db.label}</span>
                        <span className="architecture-map__tooltip">{context.db.tooltip}</span>
                      </div>
                      <span
                        className={`architecture-map__lane-connector ${
                          highlightedNodes.has(context.id) ? 'is-active' : ''
                        }`}
                        aria-hidden="true"
                      ></span>
                    </div>
                  ))}
                </div>

                <div className={`architecture-map__bus ${highlightedNodes.has('bus') ? 'is-highlighted' : ''}`} data-node="bus">
                    <span className="architecture-map__bus-label">Message Bus (RabbitMQ / Azure Service Bus)</span>
                    <div className="architecture-map__bus-events">
                      {messageBusEvents.map((event) => (
                        <span key={event.id} className="architecture-map__event-chip">
                          <span className="architecture-map__event-chip-label">{event.label}</span>
                          <span className="architecture-map__tooltip">{event.tooltip}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="architecture-map__ribbon" aria-hidden="true">
                    AKS cluster • Helm deploy • GitHub Actions CI/CD 
                  </div>
                </div>

                <div className="architecture-map__ops" aria-label="Observability stack">
                  {operationsRail.map((tool) => (
                    <div
                      key={tool.id}
                      className={`architecture-map__ops-card ${
                        highlightedNodes.has(tool.id) ? 'is-highlighted' : ''
                      }`}
                      data-node={tool.id}
                    >
                      <span className="architecture-map__ops-label">{tool.label}</span>
                      <span className="architecture-map__tooltip">{tool.tooltip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="architecture-map__legend-row">
                <div className="architecture-map__legend">
                  {legendItems.map((item) => (
                    <span key={item.id} className="architecture-map__legend-item">{item.label}</span>
                  ))}
                </div>
                <div className="architecture-map__reasons">
                  {reasonsToBelieve.map((reason, index) => (
                    <span key={reason} className="architecture-map__reason-badge">
                      {index + 1}. {reason}
                    </span>
                  ))}
                </div>
                <div className="architecture-map__metrics">
                  {proofMetrics.map((metric) => (
                    <div key={metric} className="architecture-map__metric-item">{metric}</div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="case-study" className="landing-section">
          <Container>
            <div className="case-study">
              <div className="case-study__intro">
                <div className="landing-hero__eyebrow">Case Study</div>
                <h2 className="landing-hero__title" style={{ fontSize: '1.7rem' }}>
                  What Shipping Play Economy Really Looks Like
                </h2>
                <p className="landing-hero__subtitle">
                  This build proves hands-on depth across identity, event-driven commerce, and production observability—key
                  skills your team expects on day one.
                </p>
              </div>
              <div className="case-study__grid">
                <div className="case-study__card">
                  <div className="case-study__icon" aria-hidden="true"><i className="bi bi-hdd-network"></i></div>
                  <h3 className="case-study__title">Microservice Stack</h3>
                  <ul className="case-study__list">
                    <li>.NET 8 services split by bounded context</li>
                    <li>MassTransit on RabbitMQ / Azure Service Bus</li>
                    <li>MongoDB stores for catalog, inventory, and saga state</li>
                  </ul>
                </div>
                <div className="case-study__card">
                  <div className="case-study__icon" aria-hidden="true"><i className="bi bi-arrow-repeat"></i></div>
                  <h3 className="case-study__title">Resilience Playbook</h3>
                  <ul className="case-study__list">
                    <li>Trading saga orchestrates inventory and wallet calls</li>
                    <li>Outbox + idempotent handlers keep retries safe</li>
                    <li>SignalR pushes purchase status back to the SPA</li>
                  </ul>
                </div>
                <div className="case-study__card">
                  <div className="case-study__icon" aria-hidden="true"><i className="bi bi-speedometer2"></i></div>
                  <h3 className="case-study__title">Ops & Insight</h3>
                  <ul className="case-study__list">
                    <li>Prometheus + Grafana track throughput and error rates</li>
                    <li>Jaeger traces the saga from HTTP call to message bus</li>
                    <li>Seq centralizes structured logs with user and trace IDs</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="landing-cta">
              <div className="landing-cta__content">
                <h3 className="landing-cta__title">Kick the tires yourself</h3>
                <p className="landing-cta__subtitle">
                  Sign up or browse the repositories to see the event-driven flows end to end.
                </p>
              </div>
              <div className="landing-cta__actions">
                <a className="landing-cta__button landing-cta__button--primary" href="/authentication/Login">
                  Sign Up &amp; Explore
                </a>
                <a
                  className="landing-cta__button landing-cta__button--ghost"
                  href="https://github.com/dotnetmicroservice001"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Code
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section id="screens" className="landing-section landing-section--compact">
          <Container>
            <div className="landing-hero__eyebrow">Screens</div>
            <h2 className="landing-hero__title" style={{ fontSize: '1.75rem' }}>Snapshots from the Frontend</h2>
            <Row className="mt-4">
              {[1, 2, 3].map((screen) => (
                <Col md={4} key={screen} className="mb-4">
                  <div className="landing-hero__visual" style={{ minHeight: '220px' }}>
                    <div className="landing-hero__visual-cta">
                      <i className="bi bi-window-stack mr-2" aria-hidden="true"></i>
                      Screen {screen} Placeholder
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

      </main>
    </div>
  );
};
