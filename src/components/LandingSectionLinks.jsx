import React, { useCallback, useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Landing page sections, in page order. The ids are the anchors in Landing.js.
export const LANDING_SECTIONS = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'quests', label: 'Quest' },
];

// In-page links shown in the navbar on the landing page only. Landing.js does
// the scrolling when the hash changes; this just links and tracks which
// section is current.
export const LandingSectionLinks = () => {
  const [active, setActive] = useState(null);

  // Current = the last section whose top has passed ~a third of the way down
  // the viewport (Tech Stack sits inside #architecture, so document order,
  // not intersection, decides).
  const update = useCallback(() => {
    const line = window.innerHeight * 0.35;
    let current = null;
    LANDING_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });
    setActive(current);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  return (
    <Nav className="navmenu__sections" as="ul" aria-label="On this page">
      {LANDING_SECTIONS.map(({ id, label }) => (
        <li key={id}>
          <Nav.Link
            as={Link}
            to={{ pathname: '/', hash: `#${id}` }}
            className={active === id ? 'is-active' : undefined}
            aria-current={active === id ? 'location' : undefined}
          >
            {label}
          </Nav.Link>
        </li>
      ))}
    </Nav>
  );
};
