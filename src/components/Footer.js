import React from 'react';

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner" aria-label="Site footer">
        <p className="footer__text">© {year} Sneha Basnet. GamePlayEconomy is a portfolio project developed for demonstration purposes.</p>
        <ul className="footer__contact">
          <li className="footer__contact-item">
            <a className="footer__link" href="mailto:snehabasnet224@gmail.com">
              <i className="bi bi-envelope" aria-hidden="true"></i>
              <span className="sr-only">Email</span>
            </a>
          </li>
          <li className="footer__contact-item">
            <a className="footer__link" href="https://www.linkedin.com/in/snehabasnet" target="_blank" rel="noreferrer">
              <i className="bi bi-linkedin" aria-hidden="true"></i>
              <span className="sr-only">LinkedIn</span>
            </a>
          </li>
          <li className="footer__contact-item">
            <a className="footer__link" href="https://github.com/basnets24" target="_blank" rel="noreferrer">
              <i className="bi bi-github" aria-hidden="true"></i>
              <span className="sr-only">GitHub</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};
