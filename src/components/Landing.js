import React, { useEffect, useCallback, useState, useRef } from 'react';
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

const userOutcomeCards = [
  {
    id: 'secure-sign-in',
    title: 'Sign in securely',
    description: 'Save progress and protect your inventory with verified profiles and role-aware access.',
    icon: 'bi-shield-lock'
  },
  {
    id: 'browse-buy',
    title: 'Browse & buy items',
    description: 'See accurate prices and instant availability pulled straight from the catalog service.',
    icon: 'bi-joystick'
  },
  {
    id: 'track-status',
    title: 'Track order status live',
    description: 'Watch purchase updates stream to the UI in real time—no manual refresh required.',
    icon: 'bi-lightning-charge'
  }
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
  { id: 'purchase-requested', label: 'Purchase-Requested', tooltip: 'userId, itemId, quantity, correlationId' },
  { id: 'grant-items', label: 'Grant-Items', tooltip: 'userId, catalogItemId, quantity, correlationId' },
  { id: 'inventory-granted', label: 'Inventory-Items-Granted', tooltip: 'correlationId' },
  { id: 'debit-gil', label: 'Debit-Gil', tooltip: 'userId, gil, correlationId' },
  { id: 'gil-debited', label: 'Gil-Debited', tooltip: 'correlationId' },
  { id: 'subtract-items', label: 'Subtract-Items', tooltip: 'userId, catalogItemId, quantity, correlationId' },
  { id: 'inventory-subtracted', label: 'Inventory-Items-Subtracted', tooltip: 'correlationId' }
];

const operationsRail = [
  { id: 'otel', label: 'OTel Collector', tooltip: 'Ships traces, metrics, and logs out of process.' },
  { id: 'prometheus', label: 'Prometheus', tooltip: 'Scrapes services, powers events/min, reserve success rate.' },
  { id: 'jaeger', label: 'Jaeger', tooltip: 'Distributed traces.' },
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
    id: 'auth',
    title: 'Auth',
    body: 'IdentityServer validates players with PKCE, enriches tokens with roles, and keeps SignalR connections scoped to signed-in users.'
  },
  {
    id: 'orchestration',
    title: 'Orchestration',
    body: 'Trading runs the saga: reserves inventory, debits gil, and resolves compensations with MassTransit consumers.'
  },
  {
    id: 'observability',
    title: 'Observability',
    body: 'OpenTelemetry spans stitch catalog, inventory, and trading hops; Prometheus tracks success rates while Seq keeps structured logs searchable.'
  },
  {
    id: 'deployments',
    title: 'Deployments',
    body: 'Helm charts package each service and GitHub Actions ships to AKS with environment-specific secrets.'
  }
];

const reasonsToBelieve = [
  'Product-grade UX backed by orchestrated sagas.',
  'Inventory and Catalog stay consistent without shared databases.',
  'Real-time status proven by correlated telemetry.'
];

const proofMetrics = [
  '4 focused services power sign-in, catalog, inventory, and trading',
  'Purchase confirmation arrives in under 2 seconds in demos',
  '6 coordinated messages keep the saga resilient',
  'Tracing, metrics, and logs wired in from day one'
];

export const Landing = () => {
  const tickerSequence = [...tradeTickerItems, ...tradeTickerItems];
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { hash, pathname, search } = location;
  const architectureDetailsRef = useRef(null);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 600);
  }, []);

  useEffect(() => {
    if (hash === '#case-study')
    {
      setShowCaseStudy(true);
    }
  }, [hash]);

  useEffect(() => {
    if (hash === '#architecture')
    {
      setIsArchitectureOpen(true);
      requestAnimationFrame(() => {
        if (architectureDetailsRef.current)
        {
          architectureDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
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

  const goToArchitecture = useCallback(
    (event) =>
    {
      event.preventDefault();
      setShowCaseStudy(false);
      history.replace({ pathname, search, hash: '#architecture' });
    },
    [history, pathname, search]
  );

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleArchitectureToggle = useCallback((event) =>
  {
    setIsArchitectureOpen(event.target.open);
  }, []);

  return (
    <div className="landing-page" id="top">
      <main>
        <section id="demo" className="hero-bleed landing-hero">
          <Container>
            <div className="landing-hero__content landing-hero__content--stack">
              <div className="landing-hero__eyebrow">Virtual Marketplace Demo</div>
              <TextType
                as="h1"
                className="hero-typer"
                text={'GAMEPLAY ECONOMY\nTrade and manage game items securely\nwith real-time feedback.'}
                loop={false}
                typingSpeed={54}
                pauseDuration={900}
                showCursor
                hideCursorWhileTyping
                cursorBlinkDuration={0.8}
                cursorCharacter="▍"
              />
              <p className="landing-hero__subtitle">
                Sign in, browse the catalog, and follow every purchase update without refreshing the page.
              </p>
              <div className="landing-hero__cta-row">
                <button
                  type="button"
                  className="hero-cta"
                  onClick={openCaseStudy}
                >
                  <i className="bi bi-diagram-3" aria-hidden="true"></i>
                  See How It's Built
                </button>
                <Link
                  to={AuthorizationPaths.Register}
                  className="hero-cta hero-cta--primary"
                >
                  <i className="bi bi-person-plus" aria-hidden="true"></i>
                  Create Account
                </Link>
              </div>
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

        <section id="outcomes" className="landing-section landing-section--compact">
          <Container>
            <div className="outcomes">
              <h2 className="outcomes__title">What you can do</h2>
              <p className="outcomes__subtitle">Everything players expect from a modern marketplace—delivered with one login.</p>
              <div className="outcomes__grid" role="list">
                {userOutcomeCards.map((card) => (
                  <div key={card.id} className="outcomes__card" role="listitem">
                    <div className="outcomes__card-icon" aria-hidden="true">
                      <span className="outcomes__card-icon-sheen"></span>
                      <i className={`bi ${card.icon}`}></i>
                    </div>
                    <div className="outcomes__card-content">
                      <h3 className="outcomes__card-title">{card.title}</h3>
                      <p className="outcomes__card-body">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <div id="case-study" className="case-study-anchor" aria-hidden="true"></div>

        <section id="quests" className="landing-section landing-section--gradient">
          <Container>
            <QuestTimeline />
          </Container>
        </section>

        <section className="landing-section landing-section--gradient" id="architecture">
          <Container>
            <details
              ref={architectureDetailsRef}
              className="architecture-details architecture-details--primary"
              open={isArchitectureOpen}
              onToggle={handleArchitectureToggle}
            >
              <summary className="architecture-details__summary">How it's built</summary>
              <div className="architecture-details__content">
                <p className="architecture-details__intro">
                  Identity signs players in, Catalog owns pricing, Trading orchestrates orders, and observability proves every hop for recruiters who want the full story.
                </p>

                <div className="architecture-map">
                  <div className="architecture-map__intro">
                    <div className="landing-hero__eyebrow">Architecture Map</div>
                    <h2 className="landing-hero__title" style={{ fontSize: '1.7rem' }}>
                      Identity → Catalog → Orders → Observability
                    </h2>
                    <p className="landing-hero__subtitle">
                      Follow the path from secure login to a confirmed purchase. Hover to see which service owns each step.
                    </p>
                  </div>

                  <div className="architecture-map__overlays">
                    <div className="architecture-map__overlay-caption">
                      Trading coordinates inventory and wallet updates with at-least-once messaging and SignalR status pushes.
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
                            {index < architectureTopEdge.length - 1 && (
                              <span className="architecture-map__edge-connector" aria-hidden="true"></span>
                            )}
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

                      <div
                        className={`architecture-map__bus ${highlightedNodes.has('bus') ? 'is-highlighted' : ''}`}
                        data-node="bus"
                      >
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

                <div className="architecture-details__grid">
                  {architectureDetails.map((item) => (
                    <div key={item.id} className="architecture-details__item">
                      <h3 className="architecture-details__item-title">{item.title}</h3>
                      <p className="architecture-details__item-body">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
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
          <Modal.Title id="case-study-title">Play Economy · Behind the Scenes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="case-study-sheet">
            <section className="case-study-sheet__section">
              <h4>Context</h4>
              <p>
              Built outside coursework to practice shipping an event-driven flow end to end.
              </p>
            </section>

            <section className="case-study-sheet__section">
              <h4>Goals</h4>
              <ul>
                <li>Ship a purchase loop that works locally.</li>
                <li>Keep each service owning its data so changes stay isolated.</li>
                <li>Add traces and logs that tell the story.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Constraints</h4>
              <ul>
                <li>No third-party payments—Trading owns the records.</li>
                <li>Skipped the Outbox for v1; leaned on idempotent handlers and retries.</li>
                <li>Kept the surface area small: .NET 8 + MongoDB + RabbitMQ/Azure SB, deployed on AKS with Helm.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section">
              <h4>Architecture</h4>
              <p>
                Four services—Identity, Catalog, Inventory, Trading—each own their datastore. HTTP handles commands and reads; events move state across bounded contexts. The React SPA listens over SignalR for order status so the UI never polls.
              </p>
              <p className="case-study-sheet__action">
                <a
                  href="#architecture"
                  className="case-study-sheet__link"
                  onClick={goToArchitecture}
                >
                  View architecture map →
                </a>
              </p>
            </section>

            <section className="case-study-sheet__section case-study-walkthrough">
              <h4>Walkthrough</h4>
              <ol className="case-study-walkthrough__list">
                <li className="case-study-walkthrough__item">
                  <span className="case-study-walkthrough__badge">1</span>
                  <div className="case-study-walkthrough__content">
                    <strong className="case-study-walkthrough__title">Order kicks off</strong>
                    <span className="case-study-walkthrough__body">SPA calls Orders to submit the purchase request.</span>
                  </div>
                </li>
                <li className="case-study-walkthrough__item">
                  <span className="case-study-walkthrough__badge">2</span>
                  <div className="case-study-walkthrough__content">
                    <strong className="case-study-walkthrough__title">Inventory reserves</strong>
                    <span className="case-study-walkthrough__body">Orders raises <code>OrderSubmitted</code>; Inventory reserves stock or flags insufficient quantity.</span>
                  </div>
                </li>
                <li className="case-study-walkthrough__item">
                  <span className="case-study-walkthrough__badge">3</span>
                  <div className="case-study-walkthrough__content">
                    <strong className="case-study-walkthrough__title">Wallet settles</strong>
                    <span className="case-study-walkthrough__body">Trading debits the wallet and emits balance outcomes using the shared correlation id.</span>
                  </div>
                </li>
                <li className="case-study-walkthrough__item">
                  <span className="case-study-walkthrough__badge">4</span>
                  <div className="case-study-walkthrough__content">
                    <strong className="case-study-walkthrough__title">Players get the update</strong>
                    <span className="case-study-walkthrough__body">Orders finalizes the trade and SignalR broadcasts status straight to the SPA.</span>
                  </div>
                </li>
              </ol>
            </section>

            <section className="case-study-sheet__section">
              <h4>Trade-offs &amp; Next</h4>
              <ul>
                <li>Add Outbox to Orders/Trading for atomic state+event writes.</li>
                <li>Introduce DLQs and alerting so failed saga steps surface sooner.</li>
                <li>Explore holds to unblock player-to-player trades.</li>
              </ul>
            </section>

            <section className="case-study-sheet__section case-study-sheet__quick-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/seq/" onClick={closeCaseStudy}>🔗 Example trace</a></li>
                <li><a href="https://github.com/dotnetmicroservice001" target="_blank" rel="noopener noreferrer">🔗 Repo / key files</a></li>
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
