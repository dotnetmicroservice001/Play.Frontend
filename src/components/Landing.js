import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
import authService from './api-authorization/AuthorizeService';
import { QuestTimeline } from './QuestTimeline';
import { EngineeringDecisions } from './EngineeringDecisions';
import { TechStackOverview } from './TechStackOverview';
import { BuildDeliveryDiagram, MobileArchitectureDiagram, ObservabilityDiagram } from './ArchFlowDiagrams';
import { LANDING_SECTIONS } from './LandingSectionLinks';
import { CICD_WORKFLOW_URL, GITHUB_ORG_URL, LIVE_DASHBOARDS, SERVICE_REPOS } from '../data/sourceLinks';
import TextType from './TextType';
// Old diagram, removed for now: import architectureImage from '../images/architecture.png';

export const Landing = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const history = useHistory();
  const { hash, key, pathname, search } = location;
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

  const scrollToArchitecture = useCallback(() => {
    requestAnimationFrame(() => {
      if (architectureRef.current) {
        architectureRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  // Hash links (hero CTA, navbar section links) scroll to their section. Keyed
  // on location.key so clicking the same link again still scrolls.
  useEffect(() => {
    const id = hash.slice(1);
    if (id === 'architecture') {
      // The heading + diagram block, so the whole architecture view fits on screen
      scrollToArchitecture();
    } else if (LANDING_SECTIONS.some((section) => section.id === id)) {
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [hash, key, scrollToArchitecture]);

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
                <span className="hero-disclaimer__line">Event-driven microservices on Kubernetes, running in production.</span>
                <span className="hero-disclaimer__line">
                  Saga-based distributed transactions, push‑to‑deploy pipelines and distributed tracing.
                </span>
              </p>
              {/* Guest access (try the demo) is the primary action; when already signed in
                  there's no guest button, so "See how it's built" takes the emphasis */}
              <div className="landing-hero__cta-row">
                <button
                  type="button"
                  className={`hero-cta${isAuthenticated ? ' hero-cta--primary' : ''}`}
                  // Scroll to the architecture heading + diagram; also set #architecture so the
                  // URL is shareable. Scrolling here (not only via the hash
                  // effect) keeps repeat clicks working once the hash is set.
                  onClick={() => {
                    history.push({ pathname, hash: '#architecture', search });
                    scrollToArchitecture();
                  }}
                >
                  <i className="bi bi-diagram-3" aria-hidden="true"></i>
                  See how it's built
                </button>
                <a className="hero-cta" href={GITHUB_ORG_URL} target="_blank" rel="noreferrer">
                  <i className="bi bi-github" aria-hidden="true"></i>
                  View source
                </a>
                {!isAuthenticated && (
                  <Link
                    to={{ pathname: AuthorizationPaths.Login, search: '?demo=1' }}
                    className="hero-cta hero-cta--primary"
                  >
                    <i className="bi bi-person-plus" aria-hidden="true"></i>
                    Guest access
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
                    className="arch-canvas__img arch-canvas__img--desktop"
                  />
                  {/* Phones: the same runtime system redrawn top to bottom so it stays readable */}
                  <div className="arch-canvas__mobile">
                    <MobileArchitectureDiagram />
                  </div>
                  <h3 className="arch-canvas__title">GamePlayEconomy Distributed Application Architecture</h3>
                  <p className="arch-canvas__note">
                    Catalog, Inventory, Identity and Trading each have their own database and talk to each other over a message bus.
                  </p>
                  <ul className="arch-canvas__repos" aria-label="Source repositories">
                    {SERVICE_REPOS.map((repo) => (
                      <li key={repo.name}>
                        <a className="source-link" href={repo.url} target="_blank" rel="noreferrer">
                          <i className="bi bi-github" aria-hidden="true"></i>
                          {repo.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
                {/* Build and runtime as one pair: matching frames (title bar + body, equal
                    height), told apart by material: a light plan for the pipeline, a dark
                    console for what runs in production */}
                <div className="arch-canvas__support">
                  <section className="arch-canvas__panel">
                    <h3 className="arch-canvas__heading">Build and delivery</h3>
                    <p className="arch-canvas__desc">
                      Each service repo has its own GitHub Actions workflow and Helm chart.
                    </p>
                    <div className="arch-canvas__frame">
                      <div className="arch-canvas__frame-bar">
                        <span className="arch-canvas__frame-status">
                          <i className="bi bi-git" aria-hidden="true"></i>
                          On push to main
                        </span>
                        <a className="source-link" href={CICD_WORKFLOW_URL} target="_blank" rel="noreferrer">
                          cicd.yml
                          <i className="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                        </a>
                      </div>
                      <div className="arch-canvas__frame-body">
                        <BuildDeliveryDiagram />
                      </div>
                    </div>
                  </section>
                  <section className="arch-canvas__panel">
                    <h3 className="arch-canvas__heading">Operations and observability</h3>
                    <p className="arch-canvas__desc">
                      Each service exports traces, metrics and logs through OpenTelemetry.
                    </p>
                    <div className="arch-canvas__frame arch-canvas__frame--console">
                      <div className="arch-canvas__frame-bar">
                        <ul className="arch-canvas__live" aria-label="Live dashboards">
                          {LIVE_DASHBOARDS.map((d) => (
                            <li key={d.label}>
                              <a className="source-link" href={d.url} target="_blank" rel="noreferrer">
                                {d.label}
                                <i className="bi bi-box-arrow-up-right" aria-hidden="true"></i>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="arch-canvas__frame-body">
                        <ObservabilityDiagram />
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Tech stack: full-bleed ink band, the page's one change of background */}
              <section className="techstack" id="tech-stack">
                <h2 className="doc-section__title techstack__title">Tech Stack</h2>
                <TechStackOverview />
              </section>
            </div>
          </Container>
        </section>

        {/* Key decisions, with the purchase saga as a worked example */}
        <section id="decisions" className="landing-section">
          <Container>
            <EngineeringDecisions />
          </Container>
        </section>

        {/* Quest timeline: the player's journey, closing the page */}
        <section id="quests" className="landing-section">
          <Container>
            <QuestTimeline />
          </Container>
        </section>
      </main>
    </div>
  );
};
