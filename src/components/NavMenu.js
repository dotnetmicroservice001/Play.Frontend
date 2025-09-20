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
    const [isAuthenticated, user] = await Promise.all([authService.isAuthenticated(), authService.getUser()])
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
        <Navbar bg="light" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand as={Link} to="/"><i className="bi bi-controller mr-2" aria-hidden="true"></i>GamePlay Economy</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
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
    const loginPath = `${AuthorizationPaths.Login}`;
    return (<Fragment>
      <Nav className="mr-auto">
        <Nav.Link as={Link} to="/"><i className="bi bi-house mr-1" aria-hidden="true"></i>Home</Nav.Link>
      </Nav>
      <Nav>
        <Nav.Link as={Link} to={loginPath}><i className="bi bi-box-arrow-in-right mr-1" aria-hidden="true"></i>Login</Nav.Link>
      </Nav>
    </Fragment>);
  }

  authenticatedView()
  {
    if (this.state.role === "Admin")
    {
      return (<Fragment>
        <Nav className="mr-auto">
          <Nav.Link as={Link} to={ApplicationPaths.HomePath}><i className="bi bi-house mr-1" aria-hidden="true"></i>Home</Nav.Link>
          {this.storeAndInventoryItems()}
          <Nav.Link as={Link} to={ApplicationPaths.CatalogPath}><i className="bi bi-grid mr-1" aria-hidden="true"></i>Catalog</Nav.Link>
          <Nav.Link as={Link} to={ApplicationPaths.UsersPath}><i className="bi bi-people mr-1" aria-hidden="true"></i>Users</Nav.Link>
          {this.devToolsDropdown()}
        </Nav>
        <Nav>
          {this.profileAndLogoutItems()}
        </Nav>
      </Fragment>);
    }
    else if (this.state.role === "Player")
    {
      return (<Fragment>
        <Nav className="mr-auto">
          <Nav.Link as={Link} to={ApplicationPaths.HomePath}><i className="bi bi-house mr-1" aria-hidden="true"></i>Home</Nav.Link>
          {this.storeAndInventoryItems()}
          {this.devToolsDropdown()}
        </Nav>
        <Nav>
          {this.profileAndLogoutItems()}
        </Nav>
      </Fragment>);
    }
    else
    {
      return (<Fragment>
        {this.profileAndLogoutItems()}
      </Fragment>);
    }
  }

  devToolsDropdown()
  {
    const baseLink = typeof window !== 'undefined' ? window.location.origin : '';

    const developerLinks = [
      window.RABBITMQ_URL && {
        href: window.RABBITMQ_URL,
        label: 'RabbitMQ',
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

    if (developerLinks.length === 0)
    {
      return null;
    }

    return (
      <NavDropdown title={<span><i className="bi bi-tools mr-1" aria-hidden="true"></i>Dev Tools</span>} id="dev-tools-dropdown">
        {developerLinks.map((link) => (
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

  storeAndInventoryItems()
  {
    return (<Fragment>
      <Nav.Link as={Link} to={ApplicationPaths.StorePath}><i className="bi bi-bag mr-1" aria-hidden="true"></i>Store</Nav.Link>
      <Nav.Link as={Link} to={ApplicationPaths.InventoryPath}><i className="bi bi-box-seam mr-1" aria-hidden="true"></i>My Inventory</Nav.Link>
    </Fragment>);
  }

  profileAndLogoutItems()
  {
    const profilePath = `${AuthorizationPaths.Profile}`;
    const logoutPath = { pathname: `${AuthorizationPaths.LogOut}`, state: { local: true } };
    return (<Fragment>
      <Nav.Link as={Link} to={profilePath}><i className="bi bi-person-circle mr-1" aria-hidden="true"></i>Hello {this.state.userName}</Nav.Link>
      <Nav.Link as={Link} to={logoutPath}><i className="bi bi-box-arrow-right mr-1" aria-hidden="true"></i>Logout</Nav.Link>
    </Fragment>);
  }
}
