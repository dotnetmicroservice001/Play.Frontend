import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';

const initialState = {
  items: [],
  loading: true,
  loadedSuccess: false,
};

export const Inventory = () => {
  const location = useLocation();
  const history = useHistory();
  const cameFromUsersPage = Boolean(location?.user);
  const userContext = location?.user;

  const [{ items, loading, loadedSuccess }, setState] = useState(initialState);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedItemId, setSelectedItemId] = useState(null);

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

  const totals = useMemo(() => {
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    return {
      totalQuantity,
      distinctItems: items.length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query ? items.filter((item) => item.name?.toLowerCase().includes(query)) : items;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'quantity') {
        return (b.quantity ?? 0) - (a.quantity ?? 0);
      }
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [items, search, sortBy]);

  const selectedItem = items.find((item) => item.catalogItemId === selectedItemId) ?? null;
  const closeDetail = () => setSelectedItemId(null);

  const renderGrid = () => {
    if (filteredItems.length === 0) {
      return (
        <div className="data-empty">
          <h3>No matches</h3>
          <p>No items match “{search}”. Try a different search.</p>
          <button type="button" className="data-clear-search" onClick={() => setSearch('')}>
            Clear search
          </button>
        </div>
      );
    }

    return (
      <div className="inventory-grid">
        {filteredItems.map((item) => (
          <button
            key={item.catalogItemId}
            type="button"
            className={`inventory-card${item.catalogItemId === selectedItemId ? ' inventory-card--active' : ''}`}
            onClick={() => setSelectedItemId(item.catalogItemId)}
          >
            <span className="inventory-card__image" aria-hidden="true">
              <i className="bi bi-box-seam inventory-card__glyph" aria-hidden="true"></i>
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
            <span className="inventory-card__name">{item.name}</span>
          </button>
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
            {cameFromUsersPage ? `${userContext.email}'s inventory` : 'Your inventory'}
          </h1>
          <p className="data-page__subtitle">Everything you've collected, all in one place.</p>
        </div>
        <div className="data-page__cta-row">
          <Link className="data-page__cta" to={ApplicationPaths.StorePath}>
            <i className="bi bi-bag" aria-hidden="true"></i>
            Go to store
          </Link>
        </div>
      </section>

      {!loading && loadedSuccess && (
        <section className="data-page__stats">
          <div className="data-page__stat">
            <span className="data-page__stat-label">Items</span>
            <span className="data-page__stat-value">{totals.distinctItems}</span>
          </div>
          <div className="data-page__stat">
            <span className="data-page__stat-label">Total units</span>
            <span className="data-page__stat-value">{totals.totalQuantity}</span>
          </div>
        </section>
      )}

      <section className="data-page__content inventory-layout">
        <div className="inventory-layout__grid">
          {loading && (
            <div className="data-page__loading" role="status" aria-live="polite">
              <span className="data-page__spinner" aria-hidden="true"></span>
              Loading inventory…
            </div>
          )}

          {!loading && loadedSuccess && items.length > 0 && (
            <>
              <div className="data-toolbar">
                <div className="data-toolbar__search">
                  <i className="bi bi-search" aria-hidden="true"></i>
                  <input
                    type="text"
                    placeholder="Search inventory…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search inventory"
                  />
                </div>
                <label className="data-toolbar__sort">
                  <span>Sort</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name (A–Z)</option>
                    <option value="quantity">Quantity (high–low)</option>
                  </select>
                </label>
              </div>

              {renderGrid()}
            </>
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
              <h3>Could not load items</h3>
              <p>Something went wrong while reaching the inventory service. Try refreshing in a moment.</p>
            </div>
          )}
        </div>

        {selectedItem && (
          <aside className="inventory-detail">
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
              <i className="bi bi-box-seam inventory-detail__glyph" aria-hidden="true"></i>
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
