import React from 'react';
import { Toast } from 'react-bootstrap';

export const AchievementToast = ({ show, title, message, onClose }) => (
  <div className="achievement-toast-container" aria-live="polite">
    <Toast
      show={show}
      onClose={onClose}
      delay={2500}
      autohide
      role="status"
      className="achievement-toast shadow"
    >
      <Toast.Header closeButton={true} className="achievement-toast__header">
        <span className="achievement-toast__icon" aria-hidden="true">
          <i className="bi bi-stars"></i>
        </span>
        <strong className="mr-auto">{message}</strong>
      </Toast.Header>
      <Toast.Body>
        <div className="achievement-toast__title">{title}</div>
        <div className="small text-muted">Play Economy Timeline</div>
      </Toast.Body>
    </Toast>
  </div>
);
