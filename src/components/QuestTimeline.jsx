import React from 'react';
import { quests } from '../data/quests';
import { QuestBadge } from './QuestBadge';

// Quest map banner, then the four quests as a 2×2 grid at the banner's width
// (one column on phones), each card showing what's under the hood.
export const QuestTimeline = () => (
  <section className="quest-timeline" aria-labelledby="quests-heading">
    <h2 id="quests-heading" className="sr-only">Quest timeline</h2>
    <div className="quest-timeline__map-wrap">
      <div className="quest-timeline__map">
        <div className="quest-timeline__map-shadow" aria-hidden="true"></div>
        <div className="quest-timeline__map-frame">
          <div className="quest-timeline__map-inner">
            <img
              src="/timeline.png"
              alt="Quest map: enter the realm, receive coins, browse & buy, track & collect"
              className="quest-timeline__map-img"
            />
          </div>
        </div>
      </div>
    </div>

    <ul className="quest-timeline__grid list-unstyled">
      {quests.map((quest) => (
        <li key={quest.id}>
          <QuestBadge title={quest.title} description={quest.description} tech={quest.tech} icon={quest.icon} />
        </li>
      ))}
    </ul>
  </section>
);
