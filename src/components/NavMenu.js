import React, { Component, Fragment } from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import authService from './api-authorization/AuthorizeService';
import { AuthorizationPaths } from './api-authorization/ApiAuthorizationConstants';
import { ApplicationPaths } from './Constants';
import { ThemeContext } from '../context/ThemeContext';
import '../styles/navmenu.css';

export class NavMenu extends Component
{
  static displayName = NavMenu.name;
  static contextType = ThemeContext;

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
    const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()])
    this.setState({
      isAuthenticated,
      userName: user && user.name,
      role: user && user.role
    });
  }

  render()
  {
    const { theme } = this.context;
    const navbarVariant = theme === 'dark' ? 'dark' : 'light';

    return (
      <header>
        <Navbar
          bg={navbarVariant}
          variant={navbarVariant}
          expand="lg"
          sticky="top"
          className={`navmenu navmenu--${theme}`}
        >
          <Container>
            <Navbar.Brand as={Link} to="/"><i className="bi bi-controller mr-2" aria-hidden="true"></i>GamePlay Economy</Navbar.Brand>
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
    } else
    {
      return this.authenticatedView();
    }
  }

  anonymousView()
  {
    const toggle = this.themeToggle();
    const loginPath = `${AuthorizationPaths.Login}`;
    const primaryLinks = this.renderPrimaryLinks(['home']);
    return (
      <Fragment>
        <Nav className="navmenu__primary">
          {primaryLinks}
        </Nav>
        <Nav className="navmenu__secondary">
          {toggle}
          {this.devToolsDropdown()}
          <Nav.Link as={Link} to={loginPath}>
            <i className="bi bi-box-arrow-in-right mr-1" aria-hidden="true"></i>
            Login
          </Nav.Link>
        </Nav>
      </Fragment>
    );
  }

  authenticatedView()
  {
    if (this.state.role === "Admin")
    {
      return (
        <Fragment>
          <Nav className="navmenu__primary">
            {this.renderPrimaryLinks(['home', 'store', 'inventory'])}
            {this.manageDropdown()}
          </Nav>
          <Nav className="navmenu__secondary">
            {this.themeToggle()}
            {this.devToolsDropdown()}
            {this.profileAndLogoutItems()}
          </Nav>
        </Fragment>
      );
    }
    else if (this.state.role === "Player")
    {
      return (
        <Fragment>
          <Nav className="navmenu__primary">
            {this.renderPrimaryLinks(['home', 'store', 'inventory'])}
          </Nav>
          <Nav className="navmenu__secondary">
            {this.themeToggle()}
            {this.devToolsDropdown()}
            {this.profileAndLogoutItems()}
          </Nav>
        </Fragment>
      );
    }
    else
    {
      return (
        <Fragment>
          <Nav className="navmenu__primary">
            {this.renderPrimaryLinks(['home'])}
          </Nav>
          <Nav className="navmenu__secondary">
            {this.themeToggle()}
            {this.devToolsDropdown()}
            {this.profileAndLogoutItems()}
          </Nav>
        </Fragment>
      );
    }
  }

  themeToggle()
  {
    const { theme, toggleTheme } = this.context;
    const isDark = theme === 'dark';
    const label = `Switch to ${isDark ? 'light' : 'dark'} mode`;

    return (
      <Nav.Link
        as="button"
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={label}
      >
        <span className="theme-toggle__track" aria-hidden="true">
          <span className="theme-toggle__thumb" data-theme={theme}>
            <i className={`bi ${isDark ? 'bi-moon-stars' : 'bi-sun'}`} aria-hidden="true"></i>
          </span>
        </span>
      </Nav.Link>
    );
  }

  devToolsDropdown()
  {
    const baseLink = typeof window !== 'undefined' ? window.location.origin : '';
    const { theme } = this.context;
    const isDark = theme === 'dark';
    const dropdownClassName = `navmenu__dropdown${isDark ? ' navmenu__dropdown--dark' : ''}`;

    const developerLinks = [
      window.RABBITMQ_URL && {
        href: window.RABBITMQ_URL,
        label: 'RabbitMQ(dev)',
        icon: 'bi bi-infinity'
      },
      window.CATALOG_SERVICE_URL && {
        href: `${window.CATALOG_SERVICE_URL}/swagger`,
        label: 'Catalog Swagger',
        icon: 'bi bi-journal-code'
      },
      window.INVENTORY_SERVICE_URL && {
        href: `${window.INVENTORY_SERVICE_URL}/swagger`,
        label: 'Inventory Swagger',
        icon: 'bi bi-journal-code'
      },
      window.IDENTITY_SERVICE_URL && {
        href: `${window.IDENTITY_SERVICE_URL}/swagger`,
        label: 'Identity Swagger',
        icon: 'bi bi-journal-code'
      },
      window.TRADING_SERVICE_URL && {
        href: `${window.TRADING_SERVICE_URL}/swagger`,
        label: 'Trading Swagger',
        icon: 'bi bi-journal-code'
      },
      window.SEQ_URL && {
        href: window.SEQ_URL,
        label: 'Seq logs',
        icon: 'bi bi-clipboard-data'
      },
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
      baseLink && {
        href: `${baseLink}/seq/`,
        label: 'Seq',
        icon: 'bi bi-clipboard-data'
      },
      baseLink && {
        href: `${baseLink}/jaeger/`,
        label: 'Jaeger',
        icon: 'bi bi-diagram-3'
      },
      baseLink && {
        href: `${baseLink}/prometheus/`,
        label: 'Prometheus',
        icon: 'bi bi-activity'
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
        className={dropdownClassName}
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

    const { theme } = this.context;
    const isDark = theme === 'dark';
    const dropdownClassName = `navmenu__manage navmenu__dropdown${isDark ? ' navmenu__dropdown--dark' : ''}`;

    return (
      <NavDropdown
        title={<span><i className="bi bi-gear mr-1" aria-hidden="true"></i>Manage</span>}
        id="manage-dropdown"
        className={dropdownClassName}
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
    const { theme } = this.context;
    const isDark = theme === 'dark';
    const dropdownClassName = `navmenu__profile-dropdown navmenu__dropdown${isDark ? ' navmenu__dropdown--dark' : ''}`;
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
          className={dropdownClassName}
          menuVariant={isDark ? 'dark' : undefined}
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
