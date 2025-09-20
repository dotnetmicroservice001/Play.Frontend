import React, { useEffect, useRef, useState } from 'react';
import { quests } from '../data/quests';
import { QuestBadge } from './QuestBadge';
import '../styles/quest-timeline.css';

export const QuestTimeline = () => {
  const itemRefs = useRef([]);
  const lastActiveRef = useRef(null);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    // Intersection observer toggles the active badge styling when a quest snaps into view.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const questId = Number(entry.target.getAttribute('data-quest-id'));
            const quest = quests.find((q) => q.id === questId);
            if (!quest || lastActiveRef.current === questId) {
              return;
            }

            lastActiveRef.current = questId;
            setActiveQuestId(questId);
          }
        });
      },
      {
        threshold: 0.6,
      }
    );

    itemRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Reset item refs before each render so the ref callbacks capture the latest DOM nodes.
  itemRefs.current = [];

  const displayedQuests = quests;

  return (
    <section className={`quest-timeline quest-timeline--vertical ${entered ? 'quest-timeline--entered' : ''}`}>
      <div className="quest-timeline__header text-center">
        <h2 className="quest-timeline__title">Quest Timeline</h2>
        <p className="quest-timeline__subtitle">Four moments take you from sign-in to a confirmed order—no waiting, no manual refresh.</p>
      </div>

      <div className="quest-timeline__stage" role="list" aria-label="Play Economy quest timeline">
        <div className="quest-timeline__line" aria-hidden="true"></div>
        {displayedQuests.map((quest, index) => {
          const placement = index % 2 === 0 ? 'left' : 'right';
          return (
            <div
              key={quest.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              data-quest-id={quest.id}
              className={`quest-timeline__item quest-timeline__item--${placement} ${activeQuestId === quest.id ? 'is-active' : ''}`}
              role="listitem"
            >
              <span className="quest-timeline__dot" aria-hidden="true"></span>
              <div className="quest-timeline__card">
                <QuestBadge
                  title={quest.title}
                  description={quest.description}
                  tech={quest.tech}
                  icon={quest.icon}
                  isActive={activeQuestId === quest.id}
                  placement={placement}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="quest-timeline__caption">You take the action—secure sign-in, live catalog, orchestrated purchase, instant status make it feel effortless.</p>

    </section>
  );
};
