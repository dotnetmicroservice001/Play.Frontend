import React, { useEffect, useMemo, useState } from 'react';
import { Button, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import UserModal from './form/UserModal';
import ConfirmDialog from './common/ConfirmDialog';
import inventoryLogo from '../images/inventory-bag.png';
import authService from './api-authorization/AuthorizeService';

const initialState = {
  users: [],
  loading: true,
  loadedSuccess: false,
};

export const Users = () => {
  const [{ users, loading, loadedSuccess }, setState] = useState(initialState);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const refreshUsers = async () => {
    setState((current) => ({ ...current, loading: true }));

    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${window.USERS_API_URL}`, {
        headers: !token ? {} : { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const payload = await response.json();
      setState({ users: payload ?? [], loading: false, loadedSuccess: true });
    } catch (error) {
      console.error(error);
      setState({ users: [], loading: false, loadedSuccess: false });
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalGil = users.reduce((sum, user) => sum + (user.gil ?? 0), 0);
    const averageGil = totalUsers ? Math.round(totalGil / totalUsers) : 0;
    return { totalUsers, totalGil, averageGil };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? users.filter((user) => user.email?.toLowerCase().includes(query)) : users;
  }, [users, search]);

  const confirmDelete = async () => {
    const { id } = deleteTarget;
    setDeleteTarget(null);

    try {
      const token = await authService.getAccessToken();
      const response = await fetch(`${window.USERS_API_URL}/${id}`, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not delete user');
      }

      setState((current) => ({
        ...current,
        users: current.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      console.error(error);
      setDeleteError('Could not delete the user.');
    }
  };

  const renderContent = () => {
    if (users.length === 0) {
      return (
        <div className="data-empty">
          <i className="bi bi-people data-empty__icon" aria-hidden="true"></i>
          <h3>No users yet</h3>
          <p>Provision a player to see their gil balance and inventory here.</p>
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
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search users"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="data-empty">
            <h3>No matches</h3>
            <p>No users match “{search}”. Try a different search.</p>
            <button type="button" className="data-clear-search" onClick={() => setSearch('')}>
              Clear search
            </button>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table" aria-label="Users">
              <thead>
                <tr>
                  <th scope="col">Id</th>
                  <th scope="col">Email</th>
                  <th scope="col">Gil</th>
                  <th scope="col">Inventory</th>
                  <th scope="col" className="data-table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td data-title="Id">{user.id}</td>
                    <td data-title="Email">{user.email}</td>
                    <td data-title="Gil">{user.gil}</td>
                    <td data-title="Inventory">
                      <Link
                        to={{
                          pathname: '/inventory',
                          user,
                        }}
                      >
                        <Image src={inventoryLogo} height={35} alt="View inventory" />
                      </Link>
                    </td>
                    <td data-title="Actions" className="data-table__actions">
                      <div className="data-table__action-group">
                        <UserModal user={user} compact updateUserIntoState={refreshUsers} />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`Delete ${user.email}`}
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
          <p className="data-page__eyebrow">Players</p>
          <h1 className="data-page__title">Manage accounts</h1>
          <p className="data-page__subtitle">
            Review player balances, open inventories, and keep access tidy from a single view.
          </p>
        </div>
      </section>

      <section className="data-page__stats">
        <div className="data-page__stat">
          <span className="data-page__stat-label">Players</span>
          <span className="data-page__stat-value">{stats.totalUsers}</span>
        </div>
        <div className="data-page__stat">
          <span className="data-page__stat-label">Total gil</span>
          <span className="data-page__stat-value">{stats.totalGil}</span>
        </div>
        <div className="data-page__stat">
          <span className="data-page__stat-label">Average gil</span>
          <span className="data-page__stat-value">{stats.averageGil}</span>
        </div>
      </section>

      <section className="data-page__content">
        {loading && (
          <div className="data-page__loading" role="status" aria-live="polite">
            <span className="data-page__spinner" aria-hidden="true"></span>
            Loading users…
          </div>
        )}

        {!loading && loadedSuccess && renderContent()}

        {!loading && !loadedSuccess && (
          <div className="data-empty">
            <img src="/dinoerror.png" alt="" className="data-empty__icon-img" aria-hidden="true" />
            <h3>Could not load users</h3>
            <p>Please try again in a few moments.</p>
          </div>
        )}
      </section>

      <ConfirmDialog
        show={Boolean(deleteTarget)}
        title="Delete user"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.email}"? This can't be undone.` : ''}
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

export default Users;
