import React, { useEffect, useCallback, useState } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
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

const architectureDetails = [
  {
    id: 'auth-flow',
    title: 'Identity Deep Dive',
    body: 'IdentityServer issues JWTs with gil claims. Trading validates the token, looks up wallet balances through Identity’s message contracts, and uses correlationIds to keep player status updates in sync.'
  },
  {
    id: 'catalog-flow',
    title: 'Catalog Synchronization',
    body: 'Catalog broadcasts item created/updated/deleted events. Trading consumes them to keep a local read model, so purchase totals are calculated without cross-service calls at runtime.'
  },
  {
    id: 'saga-flow',
    title: 'Saga Orchestration',
    body: 'The MassTransit state machine persists saga state in Mongo. GrantItems, InventoryItemsGranted, DebitGil, and SignalR notifications all share one correlationId so retries, compensations, and UI updates stay coordinated.'
  }
];

const reasonsToBelieve = [
  'MassTransit saga owns the workflow, not the front end.',
  'Inventory and Catalog services emit their own status events.',
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { hash, pathname, search } = location;

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 600);
  }, []);

  useEffect(() => {
    if (hash === '#case-study')
    {
      setShowCaseStudy(true);
    }
  }, [hash]);

  const openCaseStudy = useCallback(() =>
  {
    setShowCaseStudy(true);
    if (hash !== '#case-study')
    {
      history.replace({ pathname, search, hash: '#case-study' });
    }
  }, [hash, history, pathname, search]);

  const closeCaseStudy = useCallback(() =>
  {
    setShowCaseStudy(false);
    if (hash === '#case-study')
    {
      history.replace({ pathname, search, hash: '' });
    }
  }, [hash, history, pathname, search]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="landing-page" id="top">
      <main>
        <section id="demo" className="hero-bleed landing-hero">
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
                typingSpeed={60}
                pauseDuration={900}
                showCursor
                hideCursorWhileTyping
                cursorBlinkDuration={0.8}
                cursorCharacter="▍"
              />
              <p className="landing-hero__subtitle">
                Built with secure identity flows, a Trading-led SAGA for purchases, and deep observability.
              </p>
              <div className="landing-hero__cta-row">
                <button
                  type="button"
                  className="hero-cta"
                  onClick={openCaseStudy}
                >
                  <i className="bi bi-lightning-charge" aria-hidden="true"></i>
                  Read 2-min Case Study
                </button>
                <Link
                  to={AuthorizationPaths.Register}
                  className="hero-cta hero-cta--primary"
                >
                  <i className="bi bi-person-plus" aria-hidden="true"></i>
                  Sign Up &amp; Explore
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <div id="case-study" className="case-study-anchor" aria-hidden="true"></div>

        <div className="trade-ticker" aria-hidden="true">
          <div className="trade-ticker__inner">
            {tickerSequence.map((item, index) => (
              <span key={`${item}-${index}`} className="trade-ticker__item">
                {item}
              </span>
            ))}
          </div>
        </div>

        <section id="quests" className="landing-section landing-section--gradient">
          <Container>
            <QuestTimeline />
          </Container>
        </section>

        <section className="landing-section landing-section--gradient" id="architecture">
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
                  Trading keeps inventory and player balance aligned with at-least-once messaging and SignalR status updates.
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

              <details className="architecture-details">
                <summary className="architecture-details__summary">Learn more about how the services collaborate</summary>
                <div className="architecture-details__content">
                  {architectureDetails.map((item) => (
                    <div key={item.id} className="architecture-details__item">
                      <h3 className="architecture-details__item-title">{item.title}</h3>
                      <p className="architecture-details__item-body">{item.body}</p>
                    </div>
                  ))}
                </div>
              </details>

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

      </main>

      <Modal
        show={showCaseStudy}
        onHide={closeCaseStudy}
        dialogClassName="case-study-modal__dialog"
        className="case-study-modal"
        aria-labelledby="case-study-title"
        backdropClassName="case-study-modal__backdrop"
      >
        <Modal.Header closeButton>
          <Modal.Title id="case-study-title">Play Economy · Case Study</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="case-study-sheet">
            <section className="case-study-sheet__section">
              <h4>Context</h4>
              <p>
                I wanted a realistic game-economy demo that shows how I design, ship, and operate a distributed system—
                without asking reviewers to read code first.
              </p>
            </section>

            <section className="case-study-sheet__section">
              <h4>Goals</h4>
              <ul>
                <li>End-to-end purchase flow that completes locally in &lt;2s with clear success/failure paths.</li>
                <li>Separation of ownership across services; no shared DBs.</li>
                <li>Observable by default: trace every hop; expose basic metrics and structured logs.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Constraints</h4>
              <ul>
                <li>No external payments: Trading maintains the Player Balance ledger and debits/credits internally.</li>
                <li>v1 without Outbox; rely on idempotency, retries, and reconciliation.</li>
                <li>Small footprint: .NET 8, MongoDB, RabbitMQ/Azure SB, AKS, Helm, GitHub Actions.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Architecture</h4>
              <p>
                Identity, Catalog, Orders, Inventory, Trading services; each owns its MongoDB. HTTP for commands/reads,
                events on a bus for state changes. SPA frontend (React) gets live status via SignalR. Deployed to AKS with Helm.
              </p>
              <p className="case-study-sheet__action">
                <button type="button" className="case-study-sheet__link" onClick={closeCaseStudy}>
                  Open architecture map →
                </button>
              </p>
            </section>

            <section className="case-study-sheet__section case-study-sheet__section--grid">
              <div>
                <h4>Highlights</h4>
                <ul>
                  <li>SAGA-orchestrated purchase: Orders coordinates Inventory (reserve/release) and Trading (debit/revert).</li>
                  <li>Player Balance ledger: append-only entries; settlement is separate from item transfer.</li>
                  <li>Live feedback: purchase status streams to the SPA in real time.</li>
                  <li>First-class observability: OpenTelemetry traces → Jaeger; metrics → Prometheus; logs → Seq.</li>
                </ul>
              </div>
            </section>

            <section className="case-study-sheet__section">
              <h4>Walkthrough</h4>
              <ul>
                <li>SPA calls Orders (create order).</li>
                <li>Orders emits OrderSubmitted; Inventory reserves stock (InventoryReserved / InsufficientStock).</li>
                <li>Trading debits player (BalanceDebited / InsufficientFunds).</li>
                <li>Orders completes or rejects and broadcasts final status to the SPA.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Reliability &amp; Observability</h4>
              <ul>
                <li>Idempotent consumers keyed by orderId/tradeId; retry with backoff.</li>
                <li>Reconciliation jobs close or roll back stuck flows (e.g., reservation without debit).</li>
                <li>Correlated telemetry: traceId across spans/logs; simple dashboards for events/min, reserve success, and error rate.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Results (dev run)</h4>
              <ul>
                <li>Purchase path: ~7 spans, p95 ≈ 200–250 ms locally; zero drift between ledger and inventory.</li>
                <li>Swagger-first APIs let reviewers try Catalog/Inventory/Trading quickly.</li>
                <li>Traces and dashboards verify behavior—not mocks.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Trade-offs &amp; Next</h4>
              <ul>
                <li>Add Outbox to Orders/Trading for atomic state+event writes.</li>
                <li>Harden retries with DLQs and explicit alerting on stuck SAGA steps.</li>
                <li>Expand Trading to support escrow/holds for player-to-player trades.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section case-study-sheet__quick-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#top" onClick={closeCaseStudy}>Demo</a></li>
                <li><a href="#architecture" onClick={closeCaseStudy}>Architecture map</a></li>
                <li><a href="/seq" onClick={closeCaseStudy}>Example trace</a></li>
                <li><a href="https://github.com/dotnetmicroservice001" target="_blank" rel="noopener noreferrer">Repo / key files</a></li>
              </ul>
            </section>
          </div>
        </Modal.Body>
        <Modal.Footer className="case-study-sheet__footer">
          <button type="button" className="case-study-sheet__dismiss" onClick={closeCaseStudy}>
            Back to site
          </button>
        </Modal.Footer>
      </Modal>

      {showScrollTop && (
        <button
          type="button"
          className="landing-scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <span className="sr-only">Back to top</span>
          <i className="bi bi-arrow-up-short" aria-hidden="true"></i>
        </button>
      )}
    </div>
  );
};
