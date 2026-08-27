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
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { hash, pathname, search } = location;
  const architectureDetailsRef = useRef(null);

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
                    <p className="hero-disclaimer">
                      A portfolio project, built end-to-end as a production-ready microservices system.
                    </p>
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
            <h1 className="architecture-details__title">Architecture</h1>
            <p className="architecture-details__intro">
              This project demonstrates real production patterns: independently deployable services, event-driven messaging between them, container images built and shipped through CI/CD, and infrastructure provisioned as code.
            </p>
            <div className="architecture-details__image">
              <img
                src={architectureImage}
                alt="Additional architecture diagram"
                className="architecture-details__image-content reduced-centered-image"
              />
            </div>

            {/* Tech stack summary integrated within the architecture details */}
                <div className="tech-stack-section">
                  <h3>Tech Stack</h3>
                  <TechStackOverview />
                </div>
              </div>
              
            </details>
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
