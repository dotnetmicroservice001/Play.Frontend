import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';

const initialStoreState = {
  userGil: 0,
  items: [],
  loading: true,
  loadedSuccess: false
};

const initialInventoryState = {
  items: [],
  loading: true,
  loadedSuccess: false
};

const MAX_LATEST_DROPS = 3;
const MAX_BAG_ROWS = 5;

export const Home = () => {
  const [userState, setUserState] = useState({
    isAuthenticated: false,
    userName: null,
    role: null
  });

  const [store, setStore] = useState(initialStoreState);
  const [inventory, setInventory] = useState(initialInventoryState);

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

  // Same Store response Store.js reads from — one call gives us the gil
  // balance for the wallet stat and the catalog for "Latest drops".
  useEffect(() => {
    const fetchStore = async () => {
      setStore((current) => ({ ...current, loading: true }));

      try {
        const token = await authService.getAccessToken();
        const response = await fetch(`${window.STORE_API_URL}`, {
          headers: !token ? {} : { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to load store summary');
        }

        const payload = await response.json();

        setStore({
          userGil: payload.userGil ?? 0,
          items: payload.items ?? [],
          loading: false,
          loadedSuccess: true
        });
      } catch (error) {
        console.error(error);
        setStore((current) => ({ ...current, loading: false, loadedSuccess: false }));
      }
    };

    fetchStore();
  }, []);

  // Same Inventory response Inventory.js reads from — powers the "items in
  // your bag" stat and the bag preview list below.
  useEffect(() => {
    const fetchInventory = async () => {
      setInventory((current) => ({ ...current, loading: true }));

      try {
        const user = await authService.getUser();
        const token = await authService.getAccessToken();
        const response = await fetch(`${window.INVENTORY_ITEMS_API_URL}?userId=${user.sub}`, {
          headers: !token ? {} : { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to load inventory');
        }

        const items = await response.json();
        setInventory({ items, loading: false, loadedSuccess: true });
      } catch (error) {
        console.error(error);
        setInventory((current) => ({ ...current, loading: false, loadedSuccess: false }));
      }
    };

    fetchInventory();
  }, []);

  const bagQuantityTotal = useMemo(
    () => inventory.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [inventory.items]
  );

  const latestDrops = useMemo(() => {
    if (store.items.length === 0) return [];
    // Favor items the player doesn't already own so this reads like a
    // "check these out" rail; fall back to whatever the catalog has if
    // everything is already owned.
    const notOwned = store.items.filter((item) => !item.ownedQuantity);
    const pool = notOwned.length >= MAX_LATEST_DROPS ? notOwned : store.items;
    return pool.slice(0, MAX_LATEST_DROPS);
  }, [store.items]);

  const bagPreview = useMemo(
    () =>
      [...inventory.items]
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
        .slice(0, MAX_BAG_ROWS),
    [inventory.items]
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

  // The Identity claim we get back is an email address, not a display name —
  // show the local part ("demo" from "demo@player.com") so the greeting
  // reads like a name instead of a raw email.
  const greetingName = userState.userName?.split('@')[0] ?? 'player';

  return (
    <div className="home">
      <div className="home__content">
        <section className="home-hero">
          <p className="home-hero__eyebrow">Home</p>
          <h1 className="home-hero__title">Welcome back, {greetingName}.</h1>
        </section>

        <section className="home-stats">
          <div className="home-stat-card">
            <span className="home-stat-card__icon" aria-hidden="true">
              <img src="/wallet.png" alt="" className="wallet-icon" />
            </span>
            <p className="home-stat-card__label">Wallet</p>
            {store.loading && <span className="home-stat-card__spinner" role="status" aria-live="polite"></span>}
            {!store.loading && store.loadedSuccess && (
              <p className="home-stat-card__value">${store.userGil}</p>
            )}
            {!store.loading && !store.loadedSuccess && <p className="home-stat-card__value">—</p>}
            <p className="home-stat-card__caption">Available balance</p>
          </div>

          <div className="home-stat-card">
            <span className="home-stat-card__icon" aria-hidden="true">
              <img src="/purplediamond.png" alt="" className="home-stat-card__icon-img" />
            </span>
            <p className="home-stat-card__label">Items owned</p>
            {inventory.loading && <span className="home-stat-card__spinner" role="status" aria-live="polite"></span>}
            {!inventory.loading && inventory.loadedSuccess && (
              <p className="home-stat-card__value">{bagQuantityTotal}</p>
            )}
            {!inventory.loading && !inventory.loadedSuccess && <p className="home-stat-card__value">—</p>}
            <p className="home-stat-card__caption">In your bag</p>
          </div>

          <div className="home-stat-card">
            <span className="home-stat-card__icon" aria-hidden="true">
              <img src="/collection.png" alt="" className="home-stat-card__icon-img" />
            </span>
            <p className="home-stat-card__label">Collection</p>
            {inventory.loading && <span className="home-stat-card__spinner" role="status" aria-live="polite"></span>}
            {!inventory.loading && inventory.loadedSuccess && (
              <p className="home-stat-card__value">{inventory.items.length}</p>
            )}
            {!inventory.loading && !inventory.loadedSuccess && <p className="home-stat-card__value">—</p>}
            <p className="home-stat-card__caption">Unique items collected</p>
          </div>
        </section>

        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">Latest drops</h2>
            <Link to={ApplicationPaths.StorePath} className="home-section__link">
              View store <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>

          {store.loading && (
            <div className="data-page__loading" role="status" aria-live="polite">
              <span className="data-page__spinner" aria-hidden="true"></span>
              Loading catalog…
            </div>
          )}

          {!store.loading && store.loadedSuccess && latestDrops.length > 0 && (
            <div className="home-drops">
              {latestDrops.map((item) => (
                <Link key={item.id} to={ApplicationPaths.StorePath} className="home-drop-card">
                  <span className="home-drop-card__image" aria-hidden="true">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="home-drop-card__image-img"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <span className="home-drop-card__image-fallback" style={item.imageUrl ? { display: 'none' } : undefined}>
                      <i className="bi bi-image" aria-hidden="true"></i>
                    </span>
                  </span>
                  <span className="home-drop-card__body">
                    <span className="home-drop-card__name">{item.name}</span>
                    <span className="home-drop-card__description">{item.description}</span>
                    <span className="home-drop-card__footer">
                      <span className="home-drop-card__price">
                        <img src="/gil.png" alt="" className="gil-icon" aria-hidden="true" />
                        {item.price}
                      </span>
                      {item.rarity && (
                        <span className={`rarity-badge rarity-badge--${item.rarity.toLowerCase()}`}>
                          {item.rarity}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}

          {!store.loading && store.loadedSuccess && latestDrops.length === 0 && (
            <div className="data-empty">
              <i className="bi bi-shop data-empty__icon" aria-hidden="true"></i>
              <h3>No catalog items yet</h3>
              <p>Once the catalog service publishes items, you'll see them here.</p>
            </div>
          )}

          {!store.loading && !store.loadedSuccess && (
            <div className="data-empty">
              <img src="/dinoerror.png" alt="" className="data-empty__icon-img" aria-hidden="true" />
              <h3>Could not load the store</h3>
              <p>The store service didn't respond. Try refreshing in a bit.</p>
            </div>
          )}
        </section>

        <section className="home-section">
          <div className="home-section__header">
            <h2 className="home-section__title">Your bag</h2>
            <Link to={ApplicationPaths.InventoryPath} className="home-section__link">
              View inventory <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>

          {inventory.loading && (
            <div className="data-page__loading" role="status" aria-live="polite">
              <span className="data-page__spinner" aria-hidden="true"></span>
              Loading inventory…
            </div>
          )}

          {!inventory.loading && inventory.loadedSuccess && bagPreview.length > 0 && (
            <div className="home-bag-list">
              {bagPreview.map((item) => (
                <div key={item.catalogItemId} className="home-bag-row">
                  <span className="home-bag-row__image" aria-hidden="true">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="home-bag-row__image-img"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <i
                      className="bi bi-box-seam home-bag-row__glyph"
                      aria-hidden="true"
                      style={item.imageUrl ? { display: 'none' } : undefined}
                    ></i>
                  </span>
                  <span className="home-bag-row__info">
                    <span className="home-bag-row__name">{item.name}</span>
                    <span className="home-bag-row__category">{item.category || 'Uncategorized'}</span>
                  </span>
                  <span className="home-bag-row__qty">×{item.quantity}</span>
                </div>
              ))}
            </div>
          )}

          {!inventory.loading && inventory.loadedSuccess && bagPreview.length === 0 && (
            <div className="data-empty">
              <i className="bi bi-archive data-empty__icon" aria-hidden="true"></i>
              <h3>Your bag is empty</h3>
              <p>Items you collect will show up here.</p>
              <Link className="data-page__cta" to={ApplicationPaths.StorePath}>
                <i className="bi bi-bag" aria-hidden="true"></i> Browse store
              </Link>
            </div>
          )}

          {!inventory.loading && !inventory.loadedSuccess && (
            <div className="data-empty">
              <img src="/dinoerror.png" alt="" className="data-empty__icon-img" aria-hidden="true" />
              <h3>Could not load your bag</h3>
              <p>Something went wrong while reaching the inventory service. Try refreshing in a moment.</p>
            </div>
          )}
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

        <section className="home-footer-bar">
          <span className="home-footer-bar__status">
            <span className="home-footer-bar__dot" aria-hidden="true"></span>
            Dev Tools
          </span>
          <p className="home-footer-bar__note">
            The <strong>Dev Tools</strong> menu in the nav links out to Prometheus, Grafana, and Jaeger for observability into the running services.
          </p>
        </section>
      </div>
    </div>
  );
};
