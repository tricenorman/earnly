import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function BottomNavigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <ul className="bottom-nav-items">
        <li>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            🏠 Home
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={isActive('/tasks') ? 'active' : ''}>
            ✓ Tasks
          </Link>
        </li>
        <li>
          <Link to="/wallet" className={isActive('/wallet') ? 'active' : ''}>
            💳 Wallet
          </Link>
        </li>
        <li>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            👤 Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default BottomNavigation;