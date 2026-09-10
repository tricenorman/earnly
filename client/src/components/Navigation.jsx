import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav>
      <Link to="/" className="logo">
        💰 EARNLY
      </Link>
      <ul>
        <li>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={isActive('/tasks') ? 'active' : ''}>
            Tasks
          </Link>
        </li>
        <li>
          <Link to="/wallet" className={isActive('/wallet') ? 'active' : ''}>
            Wallet
          </Link>
        </li>
        <li>
          <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
            Profile
          </Link>
        </li>
        {user && user.isAdmin && (
          <li>
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
              Admin
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;