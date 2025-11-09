import { useState, useEffect } from 'react';
import type { User } from '../types/user.types';

interface HeaderProps {
  user: User;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isCollapsed, onToggleSidebar, onLogout }) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      const formattedDate = now.toLocaleDateString('en-US', options);
      setCurrentDate(formattedDate);
    };

    updateDate();
    // Update every minute to keep date accurate
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Format user display name
  const displayName = user.full_name || 'User';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          onClick={onToggleSidebar}
          className="header-toggle-btn"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
              <path d="M14 8l3 4-3 4"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
              <path d="M16 8l-3 4 3 4"/>
            </svg>
          )}
        </button>
        <div className="header-welcome">
          <span className="welcome-text">Welcome, {displayName}</span>
          <span className="date-separator">|</span>
          <span className="current-date">{currentDate}</span>
        </div>
      </div>
      <div className="header-right">
        <div className="header-user-email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span className="email-text">{user.email}</span>
        </div>
        <button 
          onClick={onLogout}
          className="header-logout-btn"
          title="Log Out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;

