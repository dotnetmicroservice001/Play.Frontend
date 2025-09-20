import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';

import '../styles/home.css';

export const Home = () => {
  const [userState, setUserState] = useState({
    isAuthenticated: false,
    userName: null,
    role: null
  });

  useEffect(() => {
    const populateState = async () => {
      const [isAuthenticated, user] = await Promise.all([
        authService.isAuthenticated(),
        authService.getUser()
      ]);

      setUserState({
        isAuthenticated,
        userName: user?.name ?? null,
        role: user?.role ?? null
      });
    };

    const subscription = authService.subscribe(populateState);
    populateState();

    return () => authService.unsubscribe(subscription);
  }, []);

  const actionTiles = useMemo(
    () => [
      {
        to: ApplicationPaths.InventoryPath,
        heading: 'This is your inventory',
        copy: 'Everything you’ve earned lives here. Track quantities, grant history, and what’s ready for your next quest.',
        icon: 'bi-backpack2'
      },
      {
        to: ApplicationPaths.StorePath,
        heading: 'The store just updated',
        copy: 'A fresh drop just landed—peek at the catalog before it sells out and let Trading do the rest.',
        icon: 'bi-bag-heart'
      }
    ],
    []
  );

  const adminLinks = useMemo(
    () => (
      userState.isAuthenticated && userState.role === 'Admin'
        ? [
            { to: ApplicationPaths.CatalogPath, label: 'Catalog' },
            { to: ApplicationPaths.UsersPath, label: 'Users' }
          ]
        : []
    ),
    [userState.isAuthenticated, userState.role]
  );

  const showDevNote = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

  return (
    <div className="home">
      <section className="home-hero">
        <h1 className="home-hero__title">Welcome back, {userState.userName ?? 'player'}.</h1>
        <p className="home-hero__blurb">
          Grab your gear, scan the latest drop, and keep the gil flowing.
        </p>
      </section>

      <section className="home-actions">
        {actionTiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="home-actions__card">
            <span className="home-actions__icon" aria-hidden="true">
              <i className={`bi ${tile.icon}`}></i>
            </span>
            <h2 className="home-actions__heading">{tile.heading}</h2>
            <p className="home-actions__copy">{tile.copy}</p>
          </Link>
        ))}
      </section>

      {adminLinks.length > 0 && (
        <section className="home-admin">
          <h3 className="home-admin__title">Admin quick links</h3>
          <div className="home-admin__chips">
            {adminLinks.map((link) => (
              <Link key={link.to} to={link.to} className="home-admin__chip">
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {showDevNote && (
        <p className="home-devnote">
          Crack open the <strong>Dev Tools</strong> menu in the nav for queues, swagger, and traces.
        </p>
      )}
    </div>
  );
};
