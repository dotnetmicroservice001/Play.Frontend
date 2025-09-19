import React from 'react';

export const QuestBadge = React.forwardRef(({ title, description, tech, icon, isActive, placement = 'right', ...rest }, ref) => (
  <article
    ref={ref}
    className={`quest-badge quest-badge--${placement} ${isActive ? 'quest-badge--active' : ''}`}
    aria-label={title}
    tabIndex={0}
    {...rest}
  >
    <div className="quest-badge__frame">
      <div className="quest-badge__icon" aria-hidden="true">
        <i className={`bi bi-${icon}`}></i>
      </div>
      <h3 className="quest-badge__title">{title}</h3>
      {description && <p className="quest-badge__description">{description}</p>}
      <ul className="quest-badge__tech list-unstyled mb-0">
        {tech.map((item) => (
          <li key={item}>
            <span className="quest-badge__chip">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </article>
));

QuestBadge.displayName = 'QuestBadge';
