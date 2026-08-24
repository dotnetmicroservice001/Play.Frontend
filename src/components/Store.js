import React, { useEffect, useMemo, useState } from 'react';
import PurchaseForm from './form/PurchaseForm';
import authService from './api-authorization/AuthorizeService';

const initialState = {
  items: [],
  userGil: 0,
  loading: true,
  loadedSuccess: false,
};

export const Store = () => {
  const [{ items, userGil, loading, loadedSuccess }, setState] = useState(initialState);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const refreshItems = async () => {
    setState((current) => ({ ...current, loading: true }));
    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${window.STORE_API_URL}`, {
        headers: !token ? {} : { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load store items');
      }

      const payload = await response.json();
      setState({
        items: payload.items ?? [],
        userGil: payload.userGil ?? 0,
        loading: false,
        loadedSuccess: true,
      });
    } catch (error) {
      console.error(error);
      setState({ items: [], userGil: 0, loading: false, loadedSuccess: false });
    }
  };

  useEffect(() => {
    refreshItems();
  }, []);

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const closeDetail = () => setSelectedItemId(null);

  const categories = useMemo(() => {
    const unique = new Set(items.map((item) => item.category || 'Uncategorized'));
    return ['All', ...Array.from(unique).sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((item) => (item.category || 'Uncategorized') === activeCategory);
  }, [items, activeCategory]);

  const renderGrid = () => {
    if (items.length === 0) {
      return (
        <div className="data-empty">
          <h3>No catalog items yet</h3>
          <p>Once the catalog service publishes items, you’ll see them here.</p>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div className="data-empty">
          <h3>No items in this category</h3>
          <p>Try a different category, or browse all items.</p>
        </div>
      );
    }

    return (
      <div className="store-grid">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`store-card${item.id === selectedItemId ? ' store-card--active' : ''}`}
            onClick={() => setSelectedItemId(item.id)}
          >
            <span className="store-card__image" aria-hidden="true">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="store-card__image-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <span className="store-card__image-fallback" style={item.imageUrl ? { display: 'none' } : undefined}>
                <i className="bi bi-image" aria-hidden="true"></i>
              </span>
              {item.id === selectedItemId && (
                <span className="store-card__selected-badge" aria-hidden="true">
                  <i className="bi bi-check-lg"></i>
                </span>
              )}
              <span className="store-card__hint" aria-hidden="true">
                <i className="bi bi-arrow-right"></i>
              </span>
            </span>
            <span className="store-card__name">{item.name}</span>
            <span className="store-card__category">{item.category || 'Uncategorized'}</span>
            <span className="store-card__description">{item.description}</span>
            <span className="store-card__footer">
              <span className="store-card__price-group">
                <span className="store-card__price">
                  <i className="bi bi-coin" aria-hidden="true"></i>
                  {item.price}
                </span>
                {item.rarity && (
                  <span className={`rarity-badge rarity-badge--${item.rarity.toLowerCase()}`}>
                    {item.rarity}
                  </span>
                )}
              </span>
              {item.ownedQuantity > 0 && (
                <span className="store-card__owned">
                  <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                  {item.ownedQuantity}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="data-page">
      <section className="data-page__header">
        <div className="data-page__header-text">
          <p className="data-page__eyebrow">Store</p>
          <h1 className="data-page__title">Browse the latest drops</h1>
        </div>

        <div className="data-page__wallet" aria-label="Gil balance">
          {loading && <span className="data-page__wallet-spinner" role="status" aria-live="polite"></span>}

          {!loading && loadedSuccess && (
            <>
              <i className="bi bi-wallet2 data-page__wallet-icon" aria-hidden="true"></i>
              <span className="data-page__wallet-value">${userGil}</span>
            </>
          )}

          {!loading && !loadedSuccess && <span className="data-page__wallet-error">—</span>}
        </div>
      </section>

      <section className={`data-page__content store-layout${selectedItem ? ' store-layout--split' : ''}`}>
        <div className="store-layout__grid">
          {loading && (
            <div className="data-page__loading" role="status" aria-live="polite">
              <span className="data-page__spinner" aria-hidden="true"></span>
              Loading catalog…
            </div>
          )}

          {!loading && loadedSuccess && items.length > 0 && (
            <div className="store-category-filters" role="tablist" aria-label="Browse by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={`store-category-filter${activeCategory === category ? ' store-category-filter--active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {!loading && loadedSuccess && renderGrid()}

          {!loading && !loadedSuccess && (
            <div className="data-empty">
              <h3>Could not load store catalog</h3>
              <p>The store service didn’t respond. Try refreshing in a bit.</p>
            </div>
          )}
        </div>

        {selectedItem && (
          <div className="store-detail-backdrop" onClick={closeDetail} aria-hidden="true"></div>
        )}

        {selectedItem && (
          <aside className="store-detail">
            <div className="store-detail__header">
              <p className="store-detail__eyebrow">Item</p>
              <button
                type="button"
                className="store-detail__close"
                onClick={closeDetail}
                aria-label="Close item details"
              >
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>

            <h2 className="store-detail__title">
              {selectedItem.name}
              {selectedItem.rarity && (
                <span className={`rarity-badge rarity-badge--${selectedItem.rarity.toLowerCase()}`}>
                  {selectedItem.rarity}
                </span>
              )}
            </h2>
            <p className="store-detail__category">{selectedItem.category || 'Uncategorized'}</p>
            <span className="store-detail__image" aria-hidden="true">
              {selectedItem.imageUrl ? (
                <img
                  src={selectedItem.imageUrl}
                  alt=""
                  className="store-detail__image-img"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <span className="store-detail__image-fallback" style={selectedItem.imageUrl ? { display: 'none' } : undefined}>
                <i className="bi bi-image" aria-hidden="true"></i>
              </span>
            </span>
            <p className="store-detail__description">{selectedItem.description}</p>

            {selectedItem.ownedQuantity > 0 && (
              <p className="store-detail__owned">You already own {selectedItem.ownedQuantity}.</p>
            )}

            <div className="store-detail__form">
              <PurchaseForm item={selectedItem} toggle={closeDetail} updateItemIntoState={refreshItems} />
            </div>
          </aside>
        )}
      </section>
    </div>
  );
};
