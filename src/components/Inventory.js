import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';

const initialState = {
  items: [],
  loading: true,
  loadedSuccess: false,
};

/* Custom pixel-art glyphs for the categories that have one (public/categories/).
   Categories are free-text from the Catalog service, not a fixed enum, so
   anything without a matching image (or an unrecognized category) falls
   back to a generic Bootstrap icon instead of guessing. */
const CATEGORY_ICON_IMAGES = {
  Weapons: '/categories/sword.png',
  'Armor & Accessories': '/categories/armor.png',
  'Potions, Scrolls & Materials': '/categories/potion.png',
  Companions: '/categories/paw.png',
};

const CATEGORY_ICONS = {
  Weapons: 'bi-lightning-fill',
  'Armor & Accessories': 'bi-shield-fill',
  'Potions, Scrolls & Materials': 'bi-flask-fill',
  Companions: 'bi-feather',
};

const getCategoryIcon = (category) => CATEGORY_ICONS[category] || 'bi-tags-fill';

/* Display-only shortening — the raw Catalog category name is still what
   drives filtering and the icon lookups above, this just keeps the rail
   tooltip and panel header from stretching out with a long label. */
const CATEGORY_SHORT_LABELS = {
  'Potions, Scrolls & Materials': 'Consumables',
};

const getCategoryLabel = (category) => CATEGORY_SHORT_LABELS[category] || category;

/* Pads the grid out with empty sockets so a light inventory still reads
   as a bag with room in it, not a stray handful of cards — matching the
   fixed-slot look of a real game inventory. Not a real capacity limit:
   just how many slots are shown before the grid grows to fit more. */
const MIN_GRID_SLOTS = 12;

/* CSS url() in inventory.css can't reach files under public/ — CRA's
   css-loader resolves them as module imports and fails to build. An
   inline style bypasses that, the same way the existing /wallet.png and
   /gil.png <img> tags elsewhere already resolve public/ assets at
   runtime rather than through webpack. */
const RIVET_STYLE = { backgroundImage: "url('/purplediamond.png')" };

export const Inventory = () => {
  const location = useLocation();
  const history = useHistory();
  const cameFromUsersPage = Boolean(location?.user);
  const userContext = location?.user;

  const [{ items, loading, loadedSuccess }, setState] = useState(initialState);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchItems = async () => {
      setState((current) => ({ ...current, loading: true }));

      try {
        let userId = '';

        if (cameFromUsersPage) {
          userId = userContext.id;
        } else {
          const user = await authService.getUser();
          userId = user.sub;
        }

        const token = await authService.getAccessToken();
        const response = await fetch(`${window.INVENTORY_ITEMS_API_URL}?userId=${userId}`, {
          headers: !token ? {} : { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }

        const returnedItems = await response.json();
        setState({ items: returnedItems, loading: false, loadedSuccess: true });
      } catch (error) {
        console.error(error);
        setState({ items: [], loading: false, loadedSuccess: false });
      }
    };

    fetchItems();
  }, [cameFromUsersPage, userContext]);

  const categories = useMemo(() => {
    const unique = new Set(items.map((item) => item.category || 'Uncategorized'));
    return ['All', ...Array.from(unique).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    const filtered = activeCategory === 'All'
      ? items
      : items.filter((item) => (item.category || 'Uncategorized') === activeCategory);

    return [...filtered].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [items, activeCategory]);

  const selectedItem = items.find((item) => item.catalogItemId === selectedItemId) ?? null;
  const closeDetail = () => setSelectedItemId(null);

  const renderGrid = () => {
    if (filteredItems.length === 0) {
      return (
        <div className="data-empty">
          <i className="bi bi-funnel data-empty__icon" aria-hidden="true"></i>
          <h3>No items in this pouch</h3>
          <p>Try a different category, or browse all items.</p>
        </div>
      );
    }

    const emptySlotCount = Math.max(0, MIN_GRID_SLOTS - filteredItems.length);

    return (
      <div className="inventory-grid">
        {filteredItems.map((item) => (
          <button
            key={item.catalogItemId}
            type="button"
            className={`inventory-card${item.rarity ? ` inventory-card--rarity-${item.rarity.toLowerCase()}` : ''}${item.catalogItemId === selectedItemId ? ' inventory-card--active' : ''}`}
            onClick={() => setSelectedItemId(item.catalogItemId)}
          >
            <span className="inventory-card__image" aria-hidden="true">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="inventory-card__image-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <i
                className="bi bi-box-seam inventory-card__glyph"
                aria-hidden="true"
                style={item.imageUrl ? { display: 'none' } : undefined}
              ></i>
              {item.catalogItemId === selectedItemId ? (
                <span className="inventory-card__selected-badge" aria-hidden="true">
                  <i className="bi bi-check-lg"></i>
                </span>
              ) : (
                <span className="inventory-card__hint" aria-hidden="true">
                  <i className="bi bi-arrow-right"></i>
                </span>
              )}
              <span className="inventory-card__stack">×{item.quantity}</span>
            </span>
            <span className="inventory-card__name">
              <i className="inventory-card__name-ornament" aria-hidden="true"></i>
              <span className="inventory-card__name-text">{item.name}</span>
              <i className="inventory-card__name-ornament" aria-hidden="true"></i>
            </span>
          </button>
        ))}

        {Array.from({ length: emptySlotCount }).map((_, index) => (
          <div key={`empty-${index}`} className="inventory-card inventory-card--empty" aria-hidden="true">
            <span className="inventory-card__image inventory-card__image--empty"></span>
            <span className="inventory-card__name inventory-card__name--empty">
              <i className="inventory-card__name-ornament" aria-hidden="true"></i>
              <span className="inventory-card__name-text">&nbsp;</span>
              <i className="inventory-card__name-ornament" aria-hidden="true"></i>
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="data-page data-page--inventory">
      <section className="data-page__header">
        <div className="data-page__header-text">
          <p className="data-page__eyebrow">Inventory</p>
          <h1 className="data-page__title">
            {cameFromUsersPage ? `${userContext.email}'s inventory` : "What's in your collection"}
          </h1>
        </div>
        <div className="data-page__cta-row">
          <Link className="data-page__cta" to={ApplicationPaths.StorePath}>
            <i className="bi bi-bag" aria-hidden="true"></i>
            Store
          </Link>
        </div>
      </section>

      <section className="data-page__content inventory-layout">
        {loading && (
          <div className="data-page__loading" role="status" aria-live="polite">
            <span className="data-page__spinner" aria-hidden="true"></span>
            Loading inventory…
          </div>
        )}

        {!loading && loadedSuccess && items.length > 0 && (
          <div className="inventory-layout__body">
            <nav className="inventory-rail-wrap" aria-label="Browse by category">
              <div className="inventory-rail__buttons">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-current={activeCategory === category}
                    aria-label={getCategoryLabel(category)}
                    title={getCategoryLabel(category)}
                    className={`inventory-rail__tab${activeCategory === category ? ' inventory-rail__tab--active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category !== 'All' && CATEGORY_ICON_IMAGES[category] ? (
                      <img
                        src={CATEGORY_ICON_IMAGES[category]}
                        alt=""
                        className="inventory-rail__tab-icon"
                        aria-hidden="true"
                      />
                    ) : (
                      <i className={`bi ${category === 'All' ? 'bi-collection' : getCategoryIcon(category)}`} aria-hidden="true"></i>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            <div className="inventory-layout__grid inventory-panel-wrap">
              <span className="inventory-panel__rivet inventory-panel__rivet--tl" style={RIVET_STYLE} aria-hidden="true"></span>
              <span className="inventory-panel__rivet inventory-panel__rivet--tr" style={RIVET_STYLE} aria-hidden="true"></span>
              <span className="inventory-panel__rivet inventory-panel__rivet--bl" style={RIVET_STYLE} aria-hidden="true"></span>
              <span className="inventory-panel__rivet inventory-panel__rivet--br" style={RIVET_STYLE} aria-hidden="true"></span>

              <div className="inventory-panel-shadow" aria-hidden="true"></div>
              <div className="inventory-panel">
               <div className="inventory-panel__gap">
                <div className="inventory-panel__border2">
                <div className="inventory-panel__inner">
                  <div className="inventory-panel__header">
                    <p className="inventory-panel__label">
                      <span className="inventory-panel__label-text">
                        {activeCategory === 'All' ? 'All items' : getCategoryLabel(activeCategory)}
                      </span>
                    </p>
                    <span className="inventory-panel__count">
                      <span className="inventory-panel__count-inner">
                        <i className="bi bi-bag-fill" aria-hidden="true"></i>
                        {filteredItems.length}/{Math.max(MIN_GRID_SLOTS, filteredItems.length)}
                      </span>
                    </span>
                  </div>

                  <div className="inventory-panel__body">{renderGrid()}</div>
                </div>
                </div>
               </div>
              </div>
            </div>
          </div>
        )}

        {!loading && loadedSuccess && items.length === 0 && (
          <div className="inventory-empty">
            <i className="bi bi-archive inventory-empty__icon" aria-hidden="true"></i>
            <h3 className="inventory-empty__title">Your inventory is empty</h3>
            <p className="inventory-empty__copy">Items you collect will appear here.</p>
            <Link className="inventory-empty__cta" to={ApplicationPaths.StorePath}>
              Browse store <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        )}

        {!loading && !loadedSuccess && (
          <div className="data-empty">
            <img src="/dinoerror.png" alt="" className="data-empty__icon-img" aria-hidden="true" />
            <h3>Could not load items</h3>
            <p>Something went wrong while reaching the inventory service. Try refreshing in a moment.</p>
          </div>
        )}

        {selectedItem && (
          <div className="inventory-detail-backdrop" onClick={closeDetail} aria-hidden="true"></div>
        )}

        {selectedItem && (
          <aside className="inventory-detail" role="dialog" aria-modal="true" aria-label={selectedItem.name}>
            <div className="inventory-detail__header">
              <p className="inventory-detail__eyebrow">Item</p>
              <button
                type="button"
                className="inventory-detail__close"
                onClick={closeDetail}
                aria-label="Close item details"
              >
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>

            <span className="inventory-detail__image" aria-hidden="true">
              {selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt=""
                  className="inventory-detail__image-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <i
                className="bi bi-box-seam inventory-detail__glyph"
                aria-hidden="true"
                style={selectedItem.imageUrl ? { display: 'none' } : undefined}
              ></i>
              <span className="inventory-detail__stack">×{selectedItem.quantity}</span>
            </span>

            <h2 className="inventory-detail__title">{selectedItem.name}</h2>
            <p className="inventory-detail__owned">
              You own <strong>×{selectedItem.quantity}</strong> of this item.
            </p>

            <hr className="inventory-detail__divider" />

            <p className="inventory-detail__description">{selectedItem.description}</p>
          </aside>
        )}
      </section>

      {cameFromUsersPage && (
        <div className="data-page__back-row">
          <button type="button" className="inventory__back" onClick={() => history.goBack()}>
            ← Back to users
          </button>
        </div>
      )}
    </div>
  );
};
