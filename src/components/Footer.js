import React from 'react';

const links = [
  { href: 'mailto:snehabasnet224@gmail.com', icon: 'envelope', label: 'Email' },
  { href: 'https://www.linkedin.com/in/snehabasnet', icon: 'linkedin', label: 'LinkedIn', external: true },
  { href: 'https://github.com/basnets24', icon: 'github', label: 'GitHub', external: true },
];

// Bookends the navbar: same ink bar and purple offset edge, same content width.
export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner" aria-label="Site footer">
        <div className="footer__brand">
          <img src="/favicon.svg" alt="" className="footer__logo" />
          <p className="footer__text">
            © {year} Sneha Basnet
            {/* Dropped on phones so the footer fits on one line */}
            <span className="footer__tagline"> · A portfolio project built for demonstration.</span>
          </p>
        </div>
        <ul className="footer__contact">
          {links.map((link) => (
            <li key={link.label}>
              <a
                className="footer__link"
                href={link.href}
                {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                <i className={`bi bi-${link.icon}`} aria-hidden="true"></i>
                <span className="sr-only">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};
