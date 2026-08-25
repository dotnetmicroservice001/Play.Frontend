import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Full-page pixel-tile message panel — used for 404s and the auth flow's
 * login/logout success, failure, and processing states, all of which used
 * to render as raw unstyled text.
 */
const StatusPage = ({ icon = 'bi-info-circle', iconImg, eyebrow, title, message, ctaLabel, ctaTo, tone = 'neutral', spin = false }) => (
  <div className="status-page">
    <div className={`status-page__panel status-page__panel--${tone}`}>
      {iconImg ? (
        <img src={iconImg} alt="" className="status-page__icon-img" aria-hidden="true" />
      ) : (
        <i className={`bi ${icon} status-page__icon${spin ? ' status-page__icon--spin' : ''}`} aria-hidden="true"></i>
      )}
      {eyebrow && <p className="status-page__eyebrow">{eyebrow}</p>}
      <h1 className="status-page__title">{title}</h1>
      {message && <p className="status-page__message">{message}</p>}
      {ctaTo && (
        <Link className="status-page__cta" to={ctaTo}>
          {ctaLabel} <i className="bi bi-arrow-right" aria-hidden="true"></i>
        </Link>
      )}
    </div>
  </div>
);

export default StatusPage;
