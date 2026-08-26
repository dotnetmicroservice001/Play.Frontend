import React from 'react'
import { Component } from 'react';
import authService from './AuthorizeService';
import { AuthenticationResultStatus } from './AuthorizeService';
import { ApplicationName, LoginActions, QueryParameterNames, AuthorizationPaths } from './ApiAuthorizationConstants';
import StatusPage from '../common/StatusPage';

// Set right before a successful login-callback hands off to the app, and
// consumed once by Home.js — lets the welcome tour distinguish "just
// signed in" (including signing back in after a logout) from "refreshed
// a page while an existing session was still valid".
export const JUST_SIGNED_IN_KEY = `${ApplicationName}.justSignedIn`;

// The main responsibility of this component is to handle the user's login process.
// This is the starting point for the login process. Any component that needs to authenticate
// a user can simply perform a redirect to this component with a returnUrl query parameter and
// let the component perform the login and return back to the return url.
export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: undefined
        };
    }

    componentDidMount() {
        const action = this.props.action;
        switch (action) {
            case LoginActions.Login:
                this.login(this.getReturnUrl());
                break;
            case LoginActions.LoginCallback:
                this.processLoginCallback();
                break;
            case LoginActions.LoginFailed:
                const params = new URLSearchParams(window.location.search);
                const error = params.get(QueryParameterNames.Message);
                this.setState({ message: error });
                break;
            case LoginActions.Profile:
                this.redirectToProfile();
                break;
            case LoginActions.Register:
                this.redirectToRegister();
                break;
            default:
                throw new Error(`Invalid action '${action}'`);
        }
    }

    render() {
        const action = this.props.action;
        const { message } = this.state;

        if (!!message) {
            return (
                <StatusPage
                    icon="bi-exclamation-octagon"
                    eyebrow="Sign-in error"
                    title="We couldn't sign you in"
                    message={message}
                    ctaLabel="Try again"
                    ctaTo={AuthorizationPaths.Login}
                    tone="danger"
                />
            );
        } else {
            switch (action) {
                case LoginActions.Login:
                    return (
                        <StatusPage
                            icon="bi-arrow-repeat"
                            title="Signing you in…"
                            message="Hang tight, this should only take a moment."
                            spin
                        />
                    );
                case LoginActions.LoginCallback:
                    return (
                        <StatusPage
                            icon="bi-arrow-repeat"
                            title="Finishing sign-in…"
                            message="Hang tight, this should only take a moment."
                            spin
                        />
                    );
                case LoginActions.LoginFailed:
                    // componentDidMount hasn't parsed the ?message= query param into
                    // state yet on this first render — briefly show a neutral state
                    // instead of falling through to the "invalid action" default.
                    return (
                        <StatusPage
                            icon="bi-arrow-repeat"
                            title="Checking sign-in status…"
                            spin
                        />
                    );
                case LoginActions.Profile:
                case LoginActions.Register:
                    return (<div></div>);
                default:
                    throw new Error(`Invalid action '${action}'`);
            }
        }
    }

    async login(returnUrl) {
        const state = { returnUrl };
        const params = new URLSearchParams(window.location.search);
        const isDemo = params.get('demo') === '1';
        const result = isDemo ? await authService.signInDemo(state) : await authService.signIn(state);
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                break;
            case AuthenticationResultStatus.Success:
                await this.navigateToReturnUrl(returnUrl);
                break;
            case AuthenticationResultStatus.Fail:
                this.setState({ message: result.message });
                break;
            default:
                throw new Error(`Invalid status result ${result.status}.`);
        }
    }

    async processLoginCallback() {
        const url = window.location.href;
        const result = await authService.completeSignIn(url);
        switch (result.status) {
            case AuthenticationResultStatus.Redirect:
                // There should not be any redirects as the only time completeSignIn finishes
                // is when we are doing a redirect sign in flow.
                throw new Error('Should not redirect.');
            case AuthenticationResultStatus.Success:
                window.sessionStorage.setItem(JUST_SIGNED_IN_KEY, '1');
                await this.navigateToReturnUrl(this.getReturnUrl(result.state));
                break;
            case AuthenticationResultStatus.Fail:
                this.setState({ message: result.message });
                break;
            default:
                throw new Error(`Invalid authentication result status '${result.status}'.`);
        }
    }

    getReturnUrl(state) {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get(QueryParameterNames.ReturnUrl);
        if (fromQuery && !fromQuery.startsWith(`${window.location.origin}/`)) {
            // This is an extra check to prevent open redirects.
            throw new Error("Invalid return url. The return url needs to have the same origin as the current page.")
        }
        return (state && state.returnUrl) || fromQuery || `${window.location.origin}${AuthorizationPaths.DefaultLoginRedirectPath}`;
    }

    redirectToRegister() {
        this.redirectToApiAuthorizationPath(window.IDENTITY_SERVICE_URL, `${AuthorizationPaths.IdentityRegisterPath}?${QueryParameterNames.ReturnUrl}=${encodeURI(AuthorizationPaths.Login)}`);
    }

    redirectToProfile() {
        this.redirectToApiAuthorizationPath(window.IDENTITY_SERVICE_URL, AuthorizationPaths.IdentityManagePath);
    }

    redirectToApiAuthorizationPath(host, apiAuthorizationPath) {
        const redirectUrl = `${host}${apiAuthorizationPath}`;
        // It's important that we do a replace here so that when the user hits the back arrow on the
        // browser he gets sent back to where it was on the app instead of to an endpoint on this
        // component.
        window.location.replace(redirectUrl);
    }

    navigateToReturnUrl(returnUrl) {
        // A same-origin destination can go through the router instead of a
        // hard reload — window.location.replace was re-downloading and
        // re-executing the whole JS bundle a second time (once for this
        // callback page, once again for the destination), on top of the
        // unavoidable reload from the external IdP redirect landing here.
        // history.replace still keeps the token-bearing callback URL out
        // of browser history, same as the reload did.
        if (this.props.history && returnUrl.startsWith(window.location.origin)) {
            const path = returnUrl.slice(window.location.origin.length) || '/';
            this.props.history.replace(path);
            return;
        }

        window.location.replace(returnUrl);
    }
}
