import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
import { QuestTimeline } from './QuestTimeline';
import { TechStackOverview } from './TechStackOverview';
import TextType from './TextType';

import '../styles/landing.css';
import architectureImage from '../images/architecture.png';

// Cards describing the main user outcomes
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

// Details content for the architecture explainer cards
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


export const Landing = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { hash, pathname, search } = location;
  const architectureDetailsRef = useRef(null);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 600);
  }, []);

  useEffect(() => {
    if (hash === '#architecture') {
      setIsArchitectureOpen(true);
      requestAnimationFrame(() => {
        if (architectureDetailsRef.current) {
          architectureDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }, [hash]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleArchitectureToggle = useCallback((event) => {
    setIsArchitectureOpen(event.target.open);
  }, []);

  return (
    <div className="landing-page" id="top">
      <main>
        {/* Hero section with headline and CTA buttons */}
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
                  // on click navigate to #architecture and open the details
                  onClick={() => history.push({ pathname, hash: '#architecture', search })}
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

        {/* User outcomes section */}
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

        {/* Placeholder anchor for case study navigation */}
        <div id="case-study" className="case-study-anchor" aria-hidden="true"></div>

        {/* Quests timeline section */}
        <section id="quests" className="landing-section landing-section--gradient">
          <Container>
            <QuestTimeline />
          </Container>
        </section>

        {/* Architecture section */}
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
                <div className="centered-text">
                  <p>
                    Identity signs players in, Catalog owns pricing, Trading orchestrates orders, and observability proves every hop for recruiters who want the full story.
                  </p>
                </div>
                <div className="architecture-details__image">
                  <img
                    src={architectureImage}
                    alt="Additional architecture diagram"
                    className="architecture-details__image-content reduced-centered-image"
                  />
                </div>

                {/*
                  Architecture map removed here to simplify the "How it's built" section.
                  The detailed map, legend, and operations cards were removed to focus
                  on the high-level overview and tech stack. The architecture image above
                  conveys the structure at a glance, and the summary and details below
                  explain the key elements. To see more details, you could provide a
                  separate page or link.
                */}

                <div className="architecture-details__grid">
                  {architectureDetails.map((item) => (
                    <div key={item.id} className="architecture-details__item">
                      <h3 className="architecture-details__item-title">{item.title}</h3>
                      <p className="architecture-details__item-body">{item.body}</p>
                    </div>
                  ))}
                </div>

                {/* Tech Stack integrated within the "How it's built" section */}
                {/* Tech stack summary integrated within the architecture details.  The
                    surrounding div uses a semantic class and relies on the
                    central stylesheet (landing_techstack_additions.css) for
                    spacing and colours rather than inline styles. */}
                <div className="tech-stack-section">
                  <h3>Tech Stack</h3>
                  <TechStackOverview />
                </div>
              </div>
            </details>
          </Container>
        </section>

        {/* Tech stack section removed from standalone position. It will be rendered within the "How it's built" section. */}

      </main>

      {/* Scroll-to-top button */}
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