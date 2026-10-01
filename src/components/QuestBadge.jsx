import React from 'react';

export const QuestBadge = ({ title, description, tech, icon }) => {
  const hasTech = Array.isArray(tech) && tech.length > 0;

  return (
    <article className="quest-badge" aria-label={title}>
      <div className="quest-badge__shadow" aria-hidden="true"></div>
      <div className="quest-badge__frame">
        <div className="quest-badge__inner">
          <div className="quest-badge__head">
            <div className="quest-badge__icon" aria-hidden="true">
              <i className={`bi bi-${icon}`}></i>
            </div>
            <h3 className="quest-badge__title">{title}</h3>
          </div>
          {description && <p className="quest-badge__description">{description}</p>}
          {hasTech && (
            <div className="quest-badge__details">
              <p className="quest-badge__details-summary">Under the hood</p>
              <ul className="quest-badge__tech list-unstyled mb-0">
                {tech.map((item) => (
                  <li key={item} className="techstack-chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
