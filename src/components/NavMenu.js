import React, { Component, Fragment } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
import { ApplicationPaths } from './Constants';

export class NavMenu extends Component
{
  static displayName = NavMenu.name;

  constructor(props)
  {
    super(props);

    this.state = {
      isAuthenticated: false,
      userName: null,
      role: null
    };
  }

  componentDidMount()
  {
    this._subscription = authService.subscribe(() => this.populateState());
    this.populateState();
  }

  componentWillUnmount()
  {
    authService.unsubscribe(this._subscription);
  }

  async populateState()
  {
    const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()]);
    this.setState({
      isAuthenticated,
      userName: user && user.name,
      role: user && user.role
    });
  }

  render()
  {
    return (
      <header>
        <Navbar
          bg="light"
          variant="light"
          expand
          sticky="top"
          className="navmenu"
        >
          <Container>
            <Navbar.Brand as={Link} to="/">
              <img src="/favicon.png" alt="" className="navmenu__logo" />
              GamePlayEconomy
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav" className="navmenu__collapse">
              {this.checkAuthAndRenderMenuItems()}
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    );
  }

  checkAuthAndRenderMenuItems()
  {
    if (!this.state.isAuthenticated)
    {
      return this.anonymousView();
    }

    return this.authenticatedView();
  }

  anonymousView()
  {
    const primaryLinks = this.renderPrimaryLinks(['login']);

    return (
      <Fragment>
        <Nav className="navmenu__primary navmenu__primary--inline">
          {primaryLinks}
        </Nav>
      </Fragment>
    );
  }

  authenticatedView()
  {
    if (this.state.role === 'Admin')
    {
      return (
        <Fragment>
          <Nav className="navmenu__primary">
            {this.renderPrimaryLinks(['home', 'store', 'inventory'])}
            {this.manageDropdown()}
          </Nav>
          <Nav className="navmenu__secondary">
            {this.devToolsDropdown()}
            {this.profileAndLogoutItems()}
          </Nav>
        </Fragment>
      );
    }

    if (this.state.role === 'Player')
    {
      return (
        <Fragment>
          <Nav className="navmenu__primary">
            {this.renderPrimaryLinks(['home', 'store', 'inventory'])}
          </Nav>
          <Nav className="navmenu__secondary">
            {this.devToolsDropdown()}
            {this.profileAndLogoutItems()}
          </Nav>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Nav className="navmenu__primary">
          {this.renderPrimaryLinks(['home'])}
        </Nav>
        <Nav className="navmenu__secondary">
          {this.devToolsDropdown()}
          {this.profileAndLogoutItems()}
        </Nav>
      </Fragment>
    );
  }

  devToolsDropdown()
  {
    const developerLinks = [
      window.PROMETHEUS_URL && {
        href: window.PROMETHEUS_URL,
        label: 'Prometheus',
        icon: 'bi bi-activity'
      },
      window.JAEGER_URL && {
        href: window.JAEGER_URL,
        label: 'Jaeger traces',
        icon: 'bi bi-diagram-3'
      },
      window.GRAFANA_URL && {
        href: window.GRAFANA_URL,
        label: 'Grafana',
        icon: 'bi bi-bar-chart-line'
      }
    ].filter(Boolean);

    const uniqueLinks = [];
    const seen = new Set();

    developerLinks.forEach((link) =>
    {
      if (!seen.has(link.href))
      {
        seen.add(link.href);
        uniqueLinks.push(link);
      }
    });

    if (uniqueLinks.length === 0)
    {
      return null;
    }

    return (
      <NavDropdown
        title={<span><i className="bi bi-tools mr-1" aria-hidden="true"></i>Dev Tools</span>}
        id="dev-tools-dropdown"
        alignRight
        className="navmenu__dropdown"
      >
        {uniqueLinks.map((link) => (
          <NavDropdown.Item
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            <i className={`${link.icon} mr-2`} aria-hidden="true"></i>
            {link.label}
          </NavDropdown.Item>
        ))}
      </NavDropdown>
    );
  }

  renderPrimaryLinks(order)
  {
    const homeDestination = this.state.isAuthenticated ? ApplicationPaths.HomePath : '/';
    const linkMap = {
      home: { to: homeDestination, icon: 'bi-house', label: 'Home' },
      login: { to: AuthorizationPaths.Login, icon: 'bi-box-arrow-in-right', label: 'Login' },
      caseStudy: { to: { pathname: '/', hash: '#case-study' }, icon: 'bi-journal-richtext', label: 'Case Study' },
      store: { to: ApplicationPaths.StorePath, icon: 'bi-bag', label: 'Store' },
      inventory: { to: ApplicationPaths.InventoryPath, icon: 'bi-box-seam', label: 'Inventory' }
    };

    return order
      .map((key) => linkMap[key])
      .filter(Boolean)
      .map((link) => (
        <Nav.Link key={link.label} as={Link} to={link.to}>
          <i className={`bi ${link.icon} mr-1`} aria-hidden="true"></i>
          {link.label}
        </Nav.Link>
      ));
  }

  manageDropdown()
  {
    if (this.state.role !== 'Admin')
    {
      return null;
    }

    return (
      <NavDropdown
        title={<span><i className="bi bi-gear mr-1" aria-hidden="true"></i>Manage</span>}
        id="manage-dropdown"
        className="navmenu__manage navmenu__dropdown"
      >
        <NavDropdown.Item as={Link} to={ApplicationPaths.CatalogPath}>
          <i className="bi bi-grid mr-2" aria-hidden="true"></i>
          Catalog
        </NavDropdown.Item>
        <NavDropdown.Item as={Link} to={ApplicationPaths.UsersPath}>
          <i className="bi bi-people mr-2" aria-hidden="true"></i>
          Users
        </NavDropdown.Item>
      </NavDropdown>
    );
  }

  profileAndLogoutItems()
  {
    const logoutPath = { pathname: `${AuthorizationPaths.LogOut}`, state: { local: true } };
    return (
      <Fragment>
        <NavDropdown
          title={
            <span className="navmenu__greeting navmenu__greeting--dropdown">
              <i className="bi bi-person-circle mr-1" aria-hidden="true"></i>
              Hello {this.state.userName}
            </span>
          }
          id="profile-dropdown"
          alignRight
          className="navmenu__profile-dropdown navmenu__dropdown"
        >
          <NavDropdown.Item
            as={Link}
            to={logoutPath}
            className="navmenu__logout-item"
          >
            <i className="bi bi-box-arrow-right mr-2" aria-hidden="true"></i>
            Logout
          </NavDropdown.Item>
        </NavDropdown>
      </Fragment>
    );
  }
}

export default NavMenu;
