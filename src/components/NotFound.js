import React from 'react';
import StatusPage from './common/StatusPage';

export const NotFound = () => (
  <StatusPage
    icon="bi-signpost-split"
    eyebrow="404"
    title="Page not found"
    message="The page you're looking for doesn't exist or may have moved."
    ctaLabel="Back to home"
    ctaTo="/"
  />
);

export default NotFound;
