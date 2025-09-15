import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { NavMenu } from './NavMenu';
import { Footer } from './Footer';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div className="app-wrapper">
        <NavMenu />
        <main className="content">
          <Container>
            {this.props.children}
          </Container>
        </main>
        <Footer />
      </div>
    );
  }
}
