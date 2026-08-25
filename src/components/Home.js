import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';
import { JUST_SIGNED_IN_KEY } from './api-authorization/Login';
import WelcomeModal from './WelcomeModal';

const DEMO_PLAYER_USERNAME = 'demo@player.com';

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

  const [showWelcome, setShowWelcome] = useState(false);
  const welcomeCheckedRef = useRef(false);

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

  // Onboarding tour opens on a fresh sign-in as the seeded demo account —
  // an initial login or a login after a logout — but not on a plain page
  // refresh of an already-signed-in session. Login.js sets the sessionStorage
  // flag right before handing off from the login callback; consuming it
  // here (remove, not just read) means it only ever fires once per login.
  useEffect(() => {
    if (welcomeCheckedRef.current) return;
    const justSignedIn = window.sessionStorage.getItem(JUST_SIGNED_IN_KEY);
    if (justSignedIn && userState.userName === DEMO_PLAYER_USERNAME) {
      welcomeCheckedRef.current = true;
      window.sessionStorage.removeItem(JUST_SIGNED_IN_KEY);
      setShowWelcome(true);
    }
  }, [userState.userName]);

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
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <div className="home__content">
        <section className="home-hero">
          <div className="home-hero__text">
            <p className="home-hero__eyebrow">Home</p>
            <h1 className="home-hero__title">Welcome back, {greetingName}.</h1>
          </div>
          <span className="home-hero__emblem" aria-hidden="true">
            <span className="home-hero__glow" aria-hidden="true"></span>
            <img src="/11.png" alt="" />
          </span>
        </section>

        <section className="home-stats">
          <div className="home-stat-segment home-stat-segment--primary">
            <span className="home-stat-segment__icon" aria-hidden="true">
              <img src="/gil.png" alt="" className="home-stat-segment__icon-img" />
            </span>
            <span className="home-stat-segment__body">
              <p className="home-stat-segment__label">Wallet</p>
              {store.loading && <span className="home-stat-segment__spinner" role="status" aria-live="polite"></span>}
              {!store.loading && store.loadedSuccess && (
                <p className="home-stat-segment__value">${store.userGil}</p>
              )}
              {!store.loading && !store.loadedSuccess && <p className="home-stat-segment__value">—</p>}
              <p className="home-stat-segment__caption">Available balance</p>
            </span>
          </div>

          <div className="home-stat-segment">
            <span className="home-stat-segment__icon" aria-hidden="true">
              <img src="/purplediamond.png" alt="" className="home-stat-segment__icon-img" />
            </span>
            <span className="home-stat-segment__body">
              <p className="home-stat-segment__label">Items owned</p>
              {inventory.loading && <span className="home-stat-segment__spinner" role="status" aria-live="polite"></span>}
              {!inventory.loading && inventory.loadedSuccess && (
                <p className="home-stat-segment__value">{bagQuantityTotal}</p>
              )}
              {!inventory.loading && !inventory.loadedSuccess && <p className="home-stat-segment__value">—</p>}
              <p className="home-stat-segment__caption">In your bag</p>
            </span>
          </div>

          <div className="home-stat-segment">
            <span className="home-stat-segment__icon" aria-hidden="true">
              <img src="/collection.png" alt="" className="home-stat-segment__icon-img" />
            </span>
            <span className="home-stat-segment__body">
              <p className="home-stat-segment__label">Collection</p>
              {inventory.loading && <span className="home-stat-segment__spinner" role="status" aria-live="polite"></span>}
              {!inventory.loading && inventory.loadedSuccess && (
                <p className="home-stat-segment__value">{inventory.items.length}</p>
              )}
              {!inventory.loading && !inventory.loadedSuccess && <p className="home-stat-segment__value">—</p>}
              <p className="home-stat-segment__caption">Unique items collected</p>
            </span>
          </div>
        </section>

        <div className="home-columns">
          <section className="home-section home-columns__main">
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

          <aside className="home-columns__rail">
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
                <div className="home-bag-pouch">
                  <span className="home-bag-pouch__shadow" aria-hidden="true"></span>
                  <div className="home-bag-pouch__frame">
                    <div className="home-bag-pouch__inner">
                      <div className="home-bag-slots">
                        {bagPreview.map((item) => (
                          <span key={item.catalogItemId} className="home-bag-slot" title={`${item.name} ×${item.quantity}`}>
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="home-bag-slot__image-img"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <i
                              className="bi bi-box-seam home-bag-slot__glyph"
                              aria-hidden="true"
                              style={item.imageUrl ? { display: 'none' } : undefined}
                            ></i>
                            <span className="home-bag-slot__qty">×{item.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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
          </aside>
        </div>
      </div>
    </div>
  );
};
