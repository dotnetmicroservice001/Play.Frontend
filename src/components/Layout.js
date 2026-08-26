import React from 'react';
import { Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';
import { ApplicationPaths } from './Constants';

const FULL_WIDTH_ROUTES = new Set([
  '/',
  ApplicationPaths.HomePath,
  ApplicationPaths.StorePath,
  ApplicationPaths.CatalogPath,
  ApplicationPaths.InventoryPath,
  ApplicationPaths.UsersPath
]);

export const Layout = ({ children }) => {
  const location = useLocation();
  const isFullWidth = FULL_WIDTH_ROUTES.has(location.pathname);

  return (
    <div className="app-wrapper">
      <NavMenu />
      <main className="content">
        {isFullWidth ? (
          <div className="page-full">{children}</div>
        ) : (
          <Container className="page-shell">{children}</Container>
        )}
      </main>
      <Footer />
    </div>
  );
};
