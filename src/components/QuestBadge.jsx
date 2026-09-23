import React, { useEffect, useState } from 'react';

// Desktop = Bootstrap's lg breakpoint. At this width and up, "Under the hood"
// is always shown; tablet and mobile keep it collapsible.
const DESKTOP_QUERY = '(min-width: 992px)';

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event) => setIsDesktop(event.matches);
    setIsDesktop(mql.matches);
    // Safari < 14 only supports the deprecated addListener/removeListener.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return isDesktop;
};

export const QuestBadge = React.forwardRef(({ title, description, tech, icon, isActive, placement = 'right', ...rest }, ref) => {
  const isDesktop = useIsDesktop();
  const hasTech = Array.isArray(tech) && tech.length > 0;

  const techList = hasTech && (
    <ul className="quest-badge__tech list-unstyled mb-0">
      {tech.map((item) => (
        <li key={item}>
          <span className="quest-badge__chip">{item}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <article
      ref={ref}
      className={`quest-badge quest-badge--${placement} ${isActive ? 'quest-badge--active' : ''}`}
      aria-label={title}
      tabIndex={0}
      {...rest}
    >
      <div className="quest-badge__shadow" aria-hidden="true"></div>
      <div className="quest-badge__frame">
        <div className="quest-badge__inner">
          <div className="quest-badge__icon" aria-hidden="true">
            <i className={`bi bi-${icon}`}></i>
          </div>
          <h3 className="quest-badge__title">{title}</h3>
          {description && <p className="quest-badge__description">{description}</p>}
          {hasTech && (isDesktop ? (
            <div className="quest-badge__details quest-badge__details--static">
              <p className="quest-badge__details-summary">Under the hood</p>
              {techList}
            </div>
          ) : (
            <details className="quest-badge__details">
              <summary className="quest-badge__details-summary">Under the hood</summary>
              {techList}
            </details>
          ))}
        </div>
      </div>
    </article>
  );
});

QuestBadge.displayName = 'QuestBadge';
