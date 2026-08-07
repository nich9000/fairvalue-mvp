import { useState } from 'react';
import { Link } from 'react-router-dom';
import Auth from './Auth';
import { getUserInitials } from '../lib/jwt';

interface NavProps {
  current: 'home' | 'search' | 'dashboard' | 'none';
  maxWidth?: number;
}

export default function Nav({ current, maxWidth = 1120 }: NavProps) {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('fairvalue_token'));
  const [showAuth, setShowAuth] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = getUserInitials();

  return (
    <nav className="nav" style={{ maxWidth, margin: '0 auto' }}>
      <span className="nav-brand">Fairvalue Index</span>

      <div className={`nav-links${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)}>
        {current === 'home' ? (
          <>
            <Link to="/deals/results">Search</Link>
            <Link to="/saved">Dashboard</Link>
            <a href="#how-it-works">How it works</a>
          </>
        ) : (
          <>
            <Link to="/deals">Home</Link>
            <Link to="/deals/results" aria-current={current === 'search' ? 'page' : undefined}>
              Search
            </Link>
            <Link to="/saved" aria-current={current === 'dashboard' ? 'page' : undefined}>
              Dashboard
            </Link>
          </>
        )}
      </div>

      {loggedIn ? (
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--color-accent-100)',
            color: 'var(--color-accent-800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </span>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={() => setShowAuth(true)}>
          Sign in
        </button>
      )}

      <button type="button" className="nav-toggle" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {menuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </>
          )}
        </svg>
      </button>

      {showAuth && (
        <Auth
          onSuccess={() => {
            setShowAuth(false);
            setLoggedIn(true);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </nav>
  );
}
