import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import ItemModal from './form/ItemModal';
import GrantItemModal from './form/GrantItemModal';
import ConfirmDialog from './common/ConfirmDialog';
import authService from './api-authorization/AuthorizeService';

const initialState = {
  items: [],
  loading: true,
  loadedSuccess: false,
};

export const Catalog = () => {
  const [{ items, loading, loadedSuccess }, setState] = useState(initialState);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [justAddedId, setJustAddedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const refreshItems = async () => {
    setState((current) => ({ ...current, loading: true }));

    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${window.CATALOG_ITEMS_API_URL}`, {
        headers: !token ? {} : { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch catalog items');
      }

      const payload = await response.json();
      setState({ items: payload ?? [], loading: false, loadedSuccess: true });
    } catch (error) {
      console.error(error);
      setState({ items: [], loading: false, loadedSuccess: false });
    }
  };

  useEffect(() => {
    refreshItems();
  }, []);

  useEffect(() => {
    if (!justAddedId) {
      return undefined;
    }

    const timeout = setTimeout(() => setJustAddedId(null), 1800);
    return () => clearTimeout(timeout);
  }, [justAddedId]);

  const addItemToState = (item) => {
    setState((current) => ({
      items: [...current.items.filter((existing) => existing.id !== item.id), item],
      loading: false,
      loadedSuccess: true,
    }));
    setJustAddedId(item.id);
  };

  const stats = useMemo(() => {
    const totalItems = items.length;
    const highestPrice = items.reduce((max, item) => Math.max(max, item.price ?? 0), 0);
    const averagePrice = totalItems
      ? (items.reduce((sum, item) => sum + (item.price ?? 0), 0) / totalItems).toFixed(2)
      : '0.00';

    return { totalItems, highestPrice, averagePrice };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query ? items.filter((item) => item.name?.toLowerCase().includes(query)) : items;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') {
        return (b.price ?? 0) - (a.price ?? 0);
      }
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [items, search, sortBy]);

  const confirmDelete = async () => {
    const { id } = deleteTarget;
    setDeleteTarget(null);

    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${window.CATALOG_ITEMS_API_URL}/${id}`, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not delete item');
      }

      setState((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== id),
      }));
    } catch (error) {
      console.error(error);
      setDeleteError('Could not delete the item.');
    }
  };

  const renderContent = () => {
    if (items.length === 0) {
      return (
        <div className="data-empty">
          <i className="bi bi-boxes catalog-empty__icon" aria-hidden="true"></i>
          <h3>No catalog items yet</h3>
          <p>Add an item to make it available in the store.</p>
        </div>
      );
    }

    return (
      <>
        <div className="data-toolbar">
          <div className="data-toolbar__search">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Search catalog…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search catalog"
            />
          </div>
          <label className="data-toolbar__sort">
            <span>Sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name (A–Z)</option>
              <option value="price">Price (high–low)</option>
            </select>
          </label>
        </div>

        {filteredItems.length === 0 ? (
          <div className="data-empty">
            <h3>No matches</h3>
            <p>No items match “{search}”. Try a different search.</p>
            <button type="button" className="data-clear-search" onClick={() => setSearch('')}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" aria-label="Catalog items">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Category</th>
                  <th scope="col">Description</th>
                  <th scope="col">Price</th>
                  <th scope="col" className="data-table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className={item.id === justAddedId ? 'catalog-row--new' : undefined}>
                    <td data-title="Item" className="catalog-table__name">
                      {item.name}
                      {item.rarity && (
                        <span className={`rarity-badge rarity-badge--${item.rarity.toLowerCase()}`}>
                          {item.rarity}
                        </span>
                      )}
                    </td>
                    <td data-title="Category">{item.category || '—'}</td>
                    <td data-title="Description" className="catalog-table__description" title={item.description}>
                      {item.description}
                    </td>
                    <td data-title="Price">
                      <span className="catalog-table__price">{item.price}</span>
                    </td>
                    <td data-title="Actions" className="data-table__actions">
                      <div className="data-table__action-group">
                        <ItemModal
                          isNew={false}
                          compact
                          item={item}
                          updateItemIntoState={refreshItems}
                          addItemToState={addItemToState}
                        />
                        <GrantItemModal item={item} compact />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Delete ${item.name}`}
                          title="Delete"
                        >
                          <i className="bi bi-trash" aria-hidden="true"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="data-page">
      <section className="data-page__header">
        <div className="data-page__header-text">
          <p className="data-page__eyebrow">Catalog</p>
          <h1 className="data-page__title">Manage store catalog</h1>
          <p className="data-page__subtitle">
            Edit items, grant loot to players, and keep the store aligned with the latest drops.
          </p>
        </div>
        <ItemModal isNew addItemToState={addItemToState} updateItemIntoState={refreshItems} />
      </section>

      <section className="data-page__stats">
        <div className="data-page__stat">
          <span className="data-page__stat-label">Items listed</span>
          <span className="data-page__stat-value">{stats.totalItems}</span>
        </div>
        <div className="data-page__stat">
          <span className="data-page__stat-label">Highest price</span>
          <span className="data-page__stat-value">{stats.highestPrice}</span>
        </div>
        <div className="data-page__stat">
          <span className="data-page__stat-label">Average price</span>
          <span className="data-page__stat-value">{stats.averagePrice}</span>
        </div>
      </section>

      <section className="data-page__content">
        {loading && (
          <div className="data-page__loading" role="status" aria-live="polite">
            <span className="data-page__spinner" aria-hidden="true"></span>
            Loading items…
          </div>
        )}

        {!loading && loadedSuccess && renderContent()}

        {!loading && !loadedSuccess && (
          <div className="data-empty">
            <img src="/dinoerror.png" alt="" className="data-empty__icon-img" aria-hidden="true" />
            <h3>Could not load items</h3>
            <p>Please try again in a few moments.</p>
          </div>
        )}
      </section>

      <ConfirmDialog
        show={Boolean(deleteTarget)}
        title="Delete item"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        show={Boolean(deleteError)}
        title="Something went wrong"
        message={deleteError}
        confirmLabel="OK"
        onConfirm={() => setDeleteError(null)}
      />
    </div>
  );
};

export default Catalog;
