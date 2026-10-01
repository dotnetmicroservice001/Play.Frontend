import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
import authService from './api-authorization/AuthorizeService';
import { QuestTimeline } from './QuestTimeline';
import { TechStackOverview } from './TechStackOverview';
import { BuildDeliveryDiagram, ObservabilityDiagram } from './ArchFlowDiagrams';
import TextType from './TextType';
// Old diagram, removed for now: import architectureImage from '../images/architecture.png';

export const Landing = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { hash, pathname, search } = location;
  const architectureRef = useRef(null);

  // "Sign in as Demo Player" always redirects straight to the IdP with no
  // check of the current session — while already authenticated, that
  // either just re-confirms the same session or silently keeps a
  // different logged-in account, neither of which is what the click
  // suggests will happen. Hiding it once signed in sidesteps both cases.
  useEffect(() => {
    const populateAuthState = () => {
      authService.isAuthenticated().then(setIsAuthenticated);
    };

    const subscription = authService.subscribe(populateAuthState);
    populateAuthState();

    return () => authService.unsubscribe(subscription);
  }, []);

  const handleScroll = useCallback(() => {
    setShowScrollTop(window.scrollY > 600);
  }, []);

  const scrollToArchitecture = useCallback(() => {
    requestAnimationFrame(() => {
      if (architectureRef.current) {
        architectureRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  useEffect(() => {
    if (hash === '#architecture') {
      scrollToArchitecture();
    }
  }, [hash, scrollToArchitecture]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="landing-page" id="top">
      <main>
        {/* Hero section with headline and CTA buttons */}
        <section id="demo" className="hero-bleed landing-hero">
          <Container>
            <div className="landing-hero__content landing-hero__content--stack">
              <div className="landing-hero__mascots">
                <img src="/wizardcrest.png" alt="GamePlayEconomy" className="landing-hero__crest" />
              </div>
              <h1 className="landing-hero__warp landing-hero__title">
                GAMEPLAY <span className="landing-hero__title-accent">ECONOMY</span>
              </h1>
              <TextType
                as="p"
                className="hero-typer"
                text="The store interface for your game."
                loop={false}
                typingSpeed={54}
                pauseDuration={900}
                showCursor
                hideCursorWhileTyping
                cursorBlinkDuration={0.8}
                cursorCharacter="▍"
              />
              <p className="hero-disclaimer">
                A portfolio project, built end-to-end as a production-ready microservices system.
              </p>
              <div className="landing-hero__cta-row">
                <button
                  type="button"
                  className="hero-cta"
                  // Scroll to the architecture heading + diagram; also set #architecture so the
                  // URL is shareable. Scrolling here (not only via the hash
                  // effect) keeps repeat clicks working once the hash is set.
                  onClick={() => {
                    history.push({ pathname, hash: '#architecture', search });
                    scrollToArchitecture();
                  }}
                >
                  <i className="bi bi-diagram-3" aria-hidden="true"></i>
                  See How It's Built
                </button>
                {!isAuthenticated && (
                  <Link
                    to={{ pathname: AuthorizationPaths.Login, search: '?demo=1' }}
                    className="hero-cta hero-cta--primary"
                  >
                    <i className="bi bi-person-plus" aria-hidden="true"></i>
                    Guest Access
                  </Link>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Architecture section: always visible, directly after the hero */}
        <section className="landing-section" id="architecture">
          <Container>
            <div className="doc-section doc-section--fit" ref={architectureRef}>
              <header className="doc-section__header">
                <h2 className="doc-section__title">Architecture</h2>
              </header>

              {/* Engineering canvas: runtime flow on top, two supporting views below */}
              <div className="arch-canvas">
                <section className="arch-canvas__primary">
                  <img
                    src="/categories/new-arch-diagram.themed.svg"
                    alt="Runtime architecture: client, Emissary ingress, four services, CosmosDB and Azure Service Bus on AKS"
                    className="arch-canvas__img"
                  />
                  <h3 className="arch-canvas__title">GamePlayEconomy Distributed Application Architecture</h3>
                  <p className="arch-canvas__note">
                    Four .NET services, Catalog, Inventory, Identity, and Trading, each own their data and communicate through asynchronous messaging.
                  </p>
                </section>
                <div className="arch-canvas__support">
                  <section className="arch-canvas__panel">
                    <h3 className="arch-canvas__heading">Build and delivery</h3>
                    <p className="arch-canvas__desc">
                      Every service ships through one pipeline, from commit to AKS.
                    </p>
                    <BuildDeliveryDiagram />
                  </section>
                  <section className="arch-canvas__panel">
                    <h3 className="arch-canvas__heading">Operations and observability</h3>
                    <p className="arch-canvas__desc">
                      Collected once with OpenTelemetry, routed to each tool.
                    </p>
                    <ObservabilityDiagram />
                  </section>
                </div>
              </div>

              {/* Tech stack: a subsection like the two supporting panels, at the canvas width */}
              <section className="techstack" id="tech-stack">
                <h3 className="arch-canvas__heading">Tech Stack</h3>
                <TechStackOverview />
              </section>
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
