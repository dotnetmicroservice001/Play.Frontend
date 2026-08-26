import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApplicationPaths } from './Constants';

const STEPS = [
  {
    eyebrow: '1 of 3',
    title: 'Your journey begins',
    body: (
      <>You've been granted <strong>200 Gil</strong> to begin exploring. Complete quests and visit new areas to earn more.</>
    ),
    image: { src: '/welcometree.png', alt: 'A wizard and his cat beneath a wisteria tree' },
  },
  {
    eyebrow: '2 of 3',
    title: 'Explore the Store',
    body: 'Browse items and discover different Store categories. The more you explore, the more Gil you can earn.',
    reward: '+25 Gil',
    cta: { label: 'Visit the Store →', to: ApplicationPaths.StorePath },
    image: { src: '/welcomecastle.png', alt: 'The wizard and his cat outside a castle tower' },
  },
  {
    eyebrow: '3 of 3',
    title: 'Build your collection',
    body: 'Items you collect are stored in your Inventory. Visit it to view your items and complete another quest.',
    reward: '+15 Gil',
    cta: { label: 'Open Inventory →', to: ApplicationPaths.InventoryPath },
    image: { src: '/welcomemeadow.png', alt: 'The wizard and his cat resting in an open meadow' },
  },
];

/**
 * Onboarding tour for the seeded demo account — see Home.js for the
 * "who sees this" check. Reappears every time the demo player lands on
 * Home (no "seen it" flag), so it doubles as a quick product walkthrough.
 *
 * Step 1's "Claim 200 Gil" is a UI stub: there's no backend endpoint yet
 * to actually grant starter Gil, so this only plays the claim animation
 * and does not touch the real wallet balance shown elsewhere in the app.
 */
export const WelcomeModal = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleClaim = () => {
    if (claiming || claimed) return;
    setClaiming(true);

    // TODO: replace with a real claim call once a starter-Gil endpoint
    // exists (e.g. POST {STORE_API_URL}/wallet/claim-starter), then
    // reconcile Home's wallet stat with the response.
    setTimeout(() => {
      setClaiming(false);
      setClaimed(true);
      setTimeout(() => setActiveStep(1), 850);
    }, 700);
  };

  const step = STEPS[activeStep];

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="welcome-modal__close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <div className="welcome-modal__step" key={activeStep}>
          <div className="welcome-modal__badge">
            <img src={step.image.src} alt={step.image.alt} />
          </div>

          <p className="welcome-modal__eyebrow">{step.eyebrow}</p>
          <h2 className="welcome-modal__title" id="welcome-modal-title">{step.title}</h2>
          <p className="welcome-modal__body">{step.body}</p>

          {step.reward && (
            <span className="welcome-modal__reward">
              <img src="/gil.png" alt="" />
              {step.reward}
            </span>
          )}

          {activeStep === 0 && !claimed && (
            <button
              type="button"
              className="welcome-modal__btn"
              onClick={handleClaim}
              disabled={claiming}
            >
              {claiming ? (
                <span className="welcome-modal__spinner" aria-hidden="true"></span>
              ) : (
                <img src="/gil.png" alt="" />
              )}
              {claiming ? 'Claiming…' : 'Claim 200 Gil'}
            </button>
          )}

          {activeStep === 0 && claimed && (
            <span className="welcome-modal__claimed">
              <img src="/gil.png" alt="" />
              +200 Gil claimed!
            </span>
          )}

          {step.cta && (
            <Link to={step.cta.to} className="welcome-modal__btn welcome-modal__btn--nav" onClick={onClose}>
              {step.cta.label}
            </Link>
          )}
        </div>

        {activeStep < STEPS.length - 1 && (
          <button
            type="button"
            className="welcome-modal__arrow welcome-modal__arrow--next"
            onClick={() => setActiveStep(activeStep + 1)}
            aria-label="Next step"
          >
            <i className="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        )}

        {activeStep > 0 && (
          <button
            type="button"
            className="welcome-modal__arrow welcome-modal__arrow--prev"
            onClick={() => setActiveStep(activeStep - 1)}
            aria-label="Previous step"
          >
            <i className="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
        )}

        <div className="welcome-modal__dots">
          {STEPS.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`welcome-modal__dot${index === activeStep ? ' welcome-modal__dot--active' : ''}${index < activeStep || (index === 0 && claimed) ? ' welcome-modal__dot--done' : ''}`}
              aria-label={`Step ${index + 1}`}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
