import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import '../styles/inventory.css';

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
        <div className="inventory-empty">
          <h3>No items yet</h3>
          <p>Once Trading grants an item, it will appear here with the latest quantity and description.</p>
        </div>
      );
    }

    return (
      <div className="inventory-table-wrapper">
        <table className="inventory-table" aria-label="Inventory items">
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
    <div className="inventory">
      <section className="inventory__header">
        <p className="inventory__eyebrow">Inventory</p>
        <h1 className="inventory__title">
          {cameFromUsersPage ? `${userContext.username}'s inventory` : 'Your inventory'}
        </h1>
        <p className="inventory__subtitle">
          Track everything Trading has granted. Quantities update in real time.
        </p>
        <div className="inventory__stats">
          <span>
            <strong>{totals.distinctItems}</strong> items 
          </span>
          <span>
            <strong>{totals.totalQuantity}</strong> total quantity
          </span>
        </div>
      </section>

      <section className="inventory__content">
        {loading && (
          <div className="inventory__loading" role="status" aria-live="polite">
            <span className="inventory__spinner" aria-hidden="true"></span>
            Loading inventory…
          </div>
        )}

        {!loading && loadedSuccess && renderTable()}

        {!loading && !loadedSuccess && (
          <div className="inventory-empty">
            <h3>Could not load items</h3>
            <p>Something went wrong while reaching the inventory service. Try refreshing in a moment.</p>
          </div>
        )}
      </section>

      {cameFromUsersPage && (
        <button type="button" className="inventory__back" onClick={() => history.goBack()}>
          ← Back to users
        </button>
      )}
    </div>
  );
};
