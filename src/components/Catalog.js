import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import ItemModal from './form/ItemModal';
import GrantItemModal from './form/GrantItemModal';
import authService from './api-authorization/AuthorizeService';

const initialState = {
  items: [],
  loading: true,
  loadedSuccess: false,
};

export const Catalog = () => {
  const [{ items, loading, loadedSuccess }, setState] = useState(initialState);

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

  const addItemToState = (item) => {
    setState((current) => ({
      items: [...current.items.filter((existing) => existing.id !== item.id), item],
      loading: false,
      loadedSuccess: true,
    }));
  };

  const stats = useMemo(() => {
    const totalItems = items.length;
    const highestPrice = items.reduce((max, item) => Math.max(max, item.price ?? 0), 0);
    const averagePrice = totalItems
      ? (items.reduce((sum, item) => sum + (item.price ?? 0), 0) / totalItems).toFixed(2)
      : '0.00';

    return { totalItems, highestPrice, averagePrice };
  }, [items]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Do you really wish to delete it?');
    if (!confirmed) {
      return;
    }

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
      window.alert('Could not delete the item.');
    }
  };

  const renderTable = () => {
    if (items.length === 0) {
      return (
        <div className="data-empty">
          <h3>No catalog items yet</h3>
          <p>Add an item to make it available in the store.</p>
        </div>
      );
    }

    return (
      <div className="data-table-wrapper">
        <table className="data-table" aria-label="Catalog items">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Description</th>
              <th scope="col">Price</th>
              <th scope="col" className="data-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td data-title="Item">{item.name}</td>
                <td data-title="Description">{item.description}</td>
                <td data-title="Price">{item.price}</td>
                <td data-title="Actions" className="data-table__actions">
                  <div className="data-table__action-group">
                    <ItemModal
                      isNew={false}
                      item={item}
                      updateItemIntoState={refreshItems}
                      addItemToState={addItemToState}
                    />
                    <GrantItemModal item={item} />
                    <Button variant="danger" onClick={() => handleDelete(item.id)}>
                      <i className="bi bi-trash mr-2" aria-hidden="true"></i>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="data-page">
      <section className="data-page__header">
        <div>
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

        {!loading && loadedSuccess && renderTable()}

        {!loading && !loadedSuccess && (
          <div className="data-empty">
            <h3>Could not load items</h3>
            <p>Please try again in a few moments.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Catalog;
