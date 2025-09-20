import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PurchaseModal from './form/PurchaseModal';
import authService from './api-authorization/AuthorizeService';
import { ApplicationPaths } from './Constants';
import '../styles/store.css';

const initialState = {
  items: [],
  userGil: 0,
  loading: true,
  loadedSuccess: false,
};

export const Store = () => {
  const [{ items, userGil, loading, loadedSuccess }, setState] = useState(initialState);

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

  const totals = useMemo(() => {
    const totalListed = items.length;
    const ownedTotal = items.reduce((sum, item) => sum + (item.ownedQuantity ?? 0), 0);
    return { totalListed, ownedTotal };
  }, [items]);

  const renderTable = () => {
    if (items.length === 0) {
      return (
        <div className="store-empty">
          <h3>No catalog items yet</h3>
          <p>Once the catalog service publishes items, you’ll see price and owned quantity here.</p>
        </div>
      );
    }

    return (
      <div className="store-table-wrapper">
        <table className="store-table" aria-label="Store catalog">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Description</th>
              <th scope="col">Price</th>
              <th scope="col">Owned</th>
              <th scope="col" className="store-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td data-title="Item">{item.name}</td>
                <td data-title="Description">{item.description}</td>
                <td data-title="Price">{item.price}</td>
                <td data-title="Owned">{item.ownedQuantity}</td>
                <td data-title="Actions" className="store-table__actions">
                  <PurchaseModal item={item} updateItemIntoState={refreshItems} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="store">
      <section className="store__header">
        <p className="store__eyebrow">Store</p>
        <h1 className="store__title">Browse the latest drops</h1>
        <p className="store__subtitle">
          Pick an item to trigger the Trading saga. Prices are cached from the catalog and owned counts update after each grant.
        </p>
        <div className="store__stats">
          <div className="store__stat">
            <span className="store__stat-label">Your gil</span>
            <span className="store__stat-value">{userGil}</span>
          </div>
          <div className="store__stat">
            <span className="store__stat-label">Items listed</span>
            <span className="store__stat-value">{totals.totalListed}</span>
          </div>
          <div className="store__stat">
            <span className="store__stat-label">Owned total</span>
            <span className="store__stat-value">{totals.ownedTotal}</span>
          </div>
        </div>
        <div className="store__cta-row">
          <Link className="store__cta" to={ApplicationPaths.InventoryPath}>
            <i className="bi bi-box-seam" aria-hidden="true"></i>
            View inventory
          </Link>
        </div>
      </section>

      <section className="store__content">
        {loading && (
          <div className="store__loading" role="status" aria-live="polite">
            <span className="store__spinner" aria-hidden="true"></span>
            Loading catalog…
          </div>
        )}

        {!loading && loadedSuccess && renderTable()}

        {!loading && !loadedSuccess && (
          <div className="store-empty">
            <h3>Could not load store catalog</h3>
            <p>The store service didn’t respond. Try refreshing in a bit.</p>
          </div>
        )}
      </section>
    </div>
  );
};
