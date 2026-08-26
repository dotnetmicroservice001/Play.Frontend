import React, { Component, Fragment } from 'react';
import { Route } from 'react-router';
import { Login } from './Login'
import { Logout } from './Logout'
import { AuthorizationPaths, LoginActions, LogoutActions } from './ApiAuthorizationConstants';

export default class ApiAuthorizationRoutes extends Component {

  render () {
    return(
      <Fragment>
          <Route path={AuthorizationPaths.Login} render={(props) => loginAction(LoginActions.Login, props)} />
          <Route path={AuthorizationPaths.LoginFailed} render={(props) => loginAction(LoginActions.LoginFailed, props)} />
          <Route path={AuthorizationPaths.LoginCallback} render={(props) => loginAction(LoginActions.LoginCallback, props)} />
          <Route path={AuthorizationPaths.Profile} render={(props) => loginAction(LoginActions.Profile, props)} />
          <Route path={AuthorizationPaths.Register} render={(props) => loginAction(LoginActions.Register, props)} />
          <Route path={AuthorizationPaths.LogOut} render={(props) => logoutAction(LogoutActions.Logout, props)} />
          <Route path={AuthorizationPaths.LogOutCallback} render={(props) => logoutAction(LogoutActions.LogoutCallback, props)} />
          <Route path={AuthorizationPaths.LoggedOut} render={(props) => logoutAction(LogoutActions.LoggedOut, props)} />
      </Fragment>);
  }
}

// Route props (history/location/match) are forwarded so Login/Logout can
// finish with a client-side history.replace instead of a hard page reload
// — see Login.js's navigateToReturnUrl.
function loginAction(name, routeProps) {
    return (<Login {...routeProps} action={name}></Login>);
}

function logoutAction(name, routeProps) {
    return (<Logout {...routeProps} action={name}></Logout>);
}
