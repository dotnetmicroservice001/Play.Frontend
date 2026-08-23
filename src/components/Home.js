import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';


const initialStats = {
  userGil: 0,
  distinctItemsOwned: 0,
  totalQuantityOwned: 0,
  loading: true,
  loadedSuccess: false
};

export const Home = () => {
  const [userState, setUserState] = useState({
    isAuthenticated: false,
    userName: null,
    role: null
  });

  const [stats, setStats] = useState(initialStats);

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

  // The Store service already returns a per-item `ownedQuantity` alongside
  // the catalog and the caller's gil balance — Store.js uses that same
  // response to compute its own "Owned total" stat. Reusing it here means
  // Home shows real account numbers without a second API call.
  useEffect(() => {
    const fetchStats = async () => {
      setStats((current) => ({ ...current, loading: true }));

      try {
        const token = await authService.getAccessToken();
        const response = await fetch(`${window.STORE_API_URL}`, {
          headers: !token ? {} : { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to load store summary');
        }

        const payload = await response.json();
        const ownedItems = (payload.items ?? []).filter((item) => (item.ownedQuantity ?? 0) > 0);

        setStats({
          userGil: payload.userGil ?? 0,
          distinctItemsOwned: ownedItems.length,
          totalQuantityOwned: ownedItems.reduce((sum, item) => sum + (item.ownedQuantity ?? 0), 0),
          loading: false,
          loadedSuccess: true
        });
      } catch (error) {
        console.error(error);
        setStats((current) => ({ ...current, loading: false, loadedSuccess: false }));
      }
    };

    fetchStats();
  }, []);

  const statTiles = useMemo(
    () => [
      { label: 'Gil balance', value: `$${stats.userGil}` },
      { label: 'Items owned', value: stats.distinctItemsOwned },
      { label: 'Total units', value: stats.totalQuantityOwned }
    ],
    [stats.userGil, stats.distinctItemsOwned, stats.totalQuantityOwned]
  );

  const actionTiles = useMemo(
    () => [
      {
        to: ApplicationPaths.InventoryPath,
        heading: 'Your inventory',
        copy: 'Every item you own, tracked one by one.',
        icon: 'bi-backpack2',
        variant: 'purple'
      },
      {
        to: ApplicationPaths.StorePath,
        heading: 'Browse the store',
        copy: 'See what’s available and complete your purchase in a few clicks.',
        icon: 'bi-bag-heart',
        variant: 'purple'
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

  // The Identity claim we get back is an email address, not a display name —
  // show the local part ("demo" from "demo@player.com") so the greeting
  // reads like a name instead of a raw email.
  const greetingName = userState.userName?.split('@')[0] ?? 'player';

  return (
    <div className="home">
      <div className="home__content">
        <section className="home-hero">
          <div className="home-hero__row">
            <p className="home-hero__eyebrow">Home</p>
            <h1 className="home-hero__title">Welcome back, {greetingName}.</h1>
          </div>
          <p className="home-hero__blurb">
            Check your inventory, browse the store, and keep track of every purchase in real time.
          </p>
        </section>

        <section className="home-stats" aria-label="Account summary">
          {stats.loading && (
            <div className="home-stats__loading" role="status" aria-live="polite">
              <span className="home-stats__spinner" aria-hidden="true"></span>
              Loading your account summary…
            </div>
          )}

          {!stats.loading && stats.loadedSuccess && (
            <div className="home-stats__grid">
              {statTiles.map((stat) => (
                <div key={stat.label} className="home-stats__tile">
                  <span className="home-stats__label">{stat.label}</span>
                  <span className="home-stats__value">{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {!stats.loading && !stats.loadedSuccess && (
            <p className="home-stats__error">
              Couldn’t reach the store service for your account summary. Try refreshing in a moment.
            </p>
          )}
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
            The <strong>Dev Tools</strong> menu in the nav links out to Prometheus, Grafana, and Jaeger for observability into the running services.
          </p>
        )}
      </div>
    </div>
  );
};
