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

  const renderTable = () => {
    if (!items || items.length === 0) {
      return (
        <div className="data-empty">
          <h3>No items yet</h3>
          <p>Once Trading grants an item, it will appear here with the latest quantity and description.</p>
        </div>
      );
    }

    return (
      <div className="data-table-wrapper">
        <table className="data-table" aria-label="Inventory items">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Description</th>
              <th scope="col">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.catalogItemId}>
                <td data-title="Item">{item.name}</td>
                <td data-title="Description">{item.description}</td>
                <td data-title="Quantity">{item.quantity}</td>
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
        <p className="data-page__eyebrow">Inventory</p>
        <h1 className="data-page__title">
          {cameFromUsersPage ? `${userContext.username}'s inventory` : 'Your inventory'}
        </h1>
        <p className="data-page__subtitle">
          Track everything Trading has granted. Quantities update in real time.
        </p>
        <div className="data-page__stats">
          <div className="data-page__stat">
            <span className="data-page__stat-label">Items</span>
            <span className="data-page__stat-value">{totals.distinctItems}</span>
          </div>
          <div className="data-page__stat">
            <span className="data-page__stat-label">Total quantity</span>
            <span className="data-page__stat-value">{totals.totalQuantity}</span>
          </div>
        </div>
        <div className="data-page__cta-row">
          <Link className="data-page__cta" to={ApplicationPaths.StorePath}>
            <i className="bi bi-bag" aria-hidden="true"></i>
            Go to store
          </Link>
        </div>
      </section>

      <section className="data-page__content">
        {loading && (
          <div className="data-page__loading" role="status" aria-live="polite">
            <span className="data-page__spinner" aria-hidden="true"></span>
            Loading inventory…
          </div>
        )}

        {!loading && loadedSuccess && renderTable()}

        {!loading && !loadedSuccess && (
          <div className="data-empty">
            <h3>Could not load items</h3>
            <p>Something went wrong while reaching the inventory service. Try refreshing in a moment.</p>
          </div>
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
