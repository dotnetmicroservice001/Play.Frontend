import React from 'react';

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer border-top text-muted">
      <div className="container py-3 text-center small">
        <div>© {year} GamePlay Economy. All rights reserved.</div>
        <div>This website is a personal portfolio created for educational purposes.</div>
        <div>
          Contact: <a href="mailto:snehabasnet224@gmail.com">snehabasnet224@gmail.com</a>
          {' '}| LinkedIn: <a href="https://www.linkedin.com/in/snehabasnet" target="_blank" rel="noreferrer">linkedin.com/in/snehabasnet</a>
          {' '}| GitHub: <a href="https://github.com/basnets24" target="_blank" rel="noreferrer">github.com/basnets24</a>
        </div>
      </div>
    </footer>
  );
};
