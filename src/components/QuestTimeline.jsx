import React from 'react';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// Section heading, then the quest map as a full-width picture (its baked-in
// title cropped off) that closes the page: the player's journey, step by step.
// A home button on it takes the reader back to the top.
export const QuestTimeline = () => (
  <section className="quest-timeline" aria-labelledby="quests-heading">
    <header className="quest-timeline__header">
      <h2 id="quests-heading" className="doc-section__title">Quest</h2>
    </header>
    <div className="quest-timeline__picture">
      <img
        src="/timeline.png"
        alt="Quest map: enter the realm, receive coins, browse & buy, track & collect"
        className="quest-timeline__map-img"
      />
      <button type="button" className="quest-timeline__home" onClick={scrollToTop}>
        <i className="bi bi-house-door-fill" aria-hidden="true"></i>
        <span className="sr-only">Back to top</span>
      </button>
    </div>
  </section>
);
