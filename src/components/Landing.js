import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
import authService from './api-authorization/AuthorizeService';
import { QuestTimeline } from './QuestTimeline';
import { TechStackOverview } from './TechStackOverview';
import TextType from './TextType';
import architectureImage from '../images/architecture.png';

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
              <figure className="architecture-doc">
                <div className="architecture-doc__figure">
                  <img
                    src={architectureImage}
                    alt="Architecture diagram: API gateway, microservices, RabbitMQ message bus and data stores"
                    className="architecture-doc__img"
                  />
                </div>
                <figcaption className="architecture-doc__caption">
                  Four .NET services, Catalog, Inventory, Identity, and Trading, each own their data and communicate through RabbitMQ. The system runs behind Emissary on AKS and deploys through GitHub Actions and Helm.
                </figcaption>
              </figure>

              {/* Tech stack: collapsed by default, sits right under the diagram */}
              <details className="techstack-details" id="tech-stack">
                <summary className="techstack-details__summary">
                  <span className="techstack-details__title">Tech Stack</span>
                  <i className="bi bi-chevron-down techstack-details__chevron" aria-hidden="true"></i>
                </summary>
                <TechStackOverview />
              </details>
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
