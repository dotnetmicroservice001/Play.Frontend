import React, { useEffect, useRef, useState } from 'react';
import { quests } from '../data/quests';
import { QuestBadge } from './QuestBadge';

export const QuestTimeline = () => {
  const itemRefs = useRef([]);
  const lastActiveRef = useRef(null);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [entered, setEntered] = useState(false);
  const [wizardTop, setWizardTop] = useState(0);
  const [wizardSide, setWizardSide] = useState('right');

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

  // The wizard "hops" to the vertical center of whichever quest item is
  // currently active, reusing the same activeQuestId the IntersectionObserver
  // above already tracks — no separate scroll-position math needed. Falls
  // back to the first item so the wizard has a resting spot before any quest
  // has crossed the 60% visibility threshold. It also always sits on the
  // side opposite the active card (desktop's left/right alternation), so it
  // never overlaps the card it's standing next to.
  useEffect(() => {
    const questId = activeQuestId ?? displayedQuests[0]?.id;
    const index = displayedQuests.findIndex((quest) => quest.id === questId);
    const item = itemRefs.current[index];
    if (!item) return undefined;

    const updatePosition = () => {
      setWizardTop(item.offsetTop + item.offsetHeight / 2);
    };

    updatePosition();
    setWizardSide(index % 2 === 0 ? 'right' : 'left');
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestId, entered]);

  return (
    <section className={`quest-timeline quest-timeline--vertical ${entered ? 'quest-timeline--entered' : ''}`}>
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

      <div className="quest-timeline__stage" role="list" aria-label="Play Economy quest timeline">
        <div className="quest-timeline__line" aria-hidden="true"></div>
        <img
          src="/11.png"
          alt=""
          aria-hidden="true"
          className={`quest-timeline__wizard quest-timeline__wizard--${wizardSide}`}
          style={{ top: `${wizardTop}px` }}
        />
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
                  title={quest.title} // Title is passed here
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
    </section>
  );
};
