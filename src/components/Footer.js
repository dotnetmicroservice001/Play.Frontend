import React from 'react';

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer border-top text-muted">
      <div className="container footer__inner small" aria-label="Site footer">
        <div className="footer__meta">
          <p className="footer__text">© {year} GamePlayEconomy. All rights reserved.</p>
          <p className="footer__text">This website is a personal portfolio created for educational purposes.</p>
          <ul className="footer__contact">
            <li className="footer__contact-item">
              <a className="footer__link" href="mailto:snehabasnet224@gmail.com">snehabasnet224@gmail.com</a>
            </li>
            <li className="footer__contact-item">
              <a className="footer__link" href="https://www.linkedin.com/in/snehabasnet" target="_blank" rel="noreferrer">
                linkedin.com/in/snehabasnet
              </a>
            </li>
            <li className="footer__contact-item">
              <a className="footer__link" href="https://github.com/basnets24" target="_blank" rel="noreferrer">
                github.com/basnets24
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
