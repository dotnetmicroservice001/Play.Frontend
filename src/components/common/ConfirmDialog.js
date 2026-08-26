import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Pixel-tile themed replacement for window.confirm/window.alert. Omit
 * cancelLabel to render as an alert (a single dismiss button) instead of
 * a confirm/cancel pair. Pass icon ({ src, alt }) to show a mascot image
 * above the message — used for friendly error states (see PurchaseForm).
 */
const ConfirmDialog = ({
  show,
  title,
  message,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => (
  <Modal show={show} onHide={onCancel ?? onConfirm} centered className="app-modal confirm-dialog">
    <Modal.Header closeButton={Boolean(onCancel)}>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {icon && <img src={icon.src} alt={icon.alt ?? ''} className="confirm-dialog__icon" />}
      <p className="confirm-dialog__message">{message}</p>
      <div className="confirm-dialog__actions">
        {cancelLabel && (
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
        )}
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal.Body>
  </Modal>
);

export default ConfirmDialog;
