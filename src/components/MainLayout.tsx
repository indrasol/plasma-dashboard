import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { User, UserRole } from '../types/user.types';
import Header from './Header';

interface NavLinkItem {
  label: string;
  link: string;
  roles: UserRole[];
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavLinkItem[];
  roles: UserRole[];
}

interface MainLayoutProps {
  user: User;
  setUser: (user: User | null) => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, setUser, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navigationSections: NavSection[] = [
    {
      title: "Main",
      roles: ["admin", "marketing", "super_admin"],
      items: [
        { 
          label: "Dashboard", 
          link: "/dashboard", 
          roles: ["admin", "marketing", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          )
        },
        { 
          label: "Donors", 
          link: "/donors", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )
        },
        { 
          label: "Influencers", 
          link: "/influencers", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )
        },
        { 
          label: "Campaigns", 
          link: "/campaigns", 
          roles: ["admin","marketing","super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )
        },
        { 
          label: "Settings", 
          link: "/settings", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Management",
      roles: ["super_admin"],
      items: [
        { 
          label: "Manage Users", 
          link: "/manage-users", 
          roles: ["super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )
        },
        { 
          label: "Center Management", 
          link: "/center-management", 
          roles: ["super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18"/>
              <path d="M5 21V7l8-4v18"/>
              <path d="M19 21V11l-6-4"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M9 21V11"/>
            </svg>
          )
        }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("plasmalytics_user");
    setUser(null);
    window.location.href = '/';
  };

  return (
    <div className='dashboard-layout'>
      
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className='sidebar-header'>
          {!isCollapsed && (
            <div className="sidebar-logo-container">
              <img src="/cen_icon-removebg.png" alt="CentroidAI Icon" className="sidebar-logo-icon" />
              <span className="sidebar-logo-text">CentroidAI</span>
            </div>
          )}
        </div>

        <div className='sidebar-nav'>
          {navigationSections.map(section => 
            section.roles.some(role => role === user?.role) && (
              <div key={section.title} className="nav-section">
                {!isCollapsed && (
                  <div className="nav-section-title">{section.title}</div>
                )}
                <div className="nav-section-items">
                  {section.items.map(item =>
                    item.roles.includes(user?.role) && (
                      <NavLink 
                        key={item.link}
                        to={item.link}
                        end 
                        className={({isActive}) => isActive ? "nav-active" : ""}
                        title={isCollapsed ? item.label : ""}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                      </NavLink>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* AI Assistant Button - Glassmorphism */}
        <div className="sidebar-ai-section">
          <NavLink 
            to="/ask-ai"
            className={({isActive}) => `ai-assistant-btn ${isActive ? 'active' : ''}`}
            title={isCollapsed ? "Ask CAI" : ""}
          >
            <div className="ai-btn-glow"></div>
            <div className="ai-btn-content">
              <span className="ai-btn-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  <circle cx="9" cy="10" r="1" fill="currentColor"/>
                  <circle cx="15" cy="10" r="1" fill="currentColor"/>
                  <path d="M9 14h6" strokeLinecap="round"/>
                </svg>
              </span>
              {!isCollapsed && (
                <span className="ai-btn-text">
                  <span className="ai-btn-label">Ask CAI</span>
                  <span className="ai-btn-sublabel">Your AI Assistant</span>
                </span>
              )}
            </div>
          </NavLink>
        </div>
      </nav>

      <main className={`dashboard-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          user={user} 
          isCollapsed={isCollapsed} 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
          onLogout={handleLogout}
        />
        {children}
      </main>

    </div>
  );
};

export default MainLayout;

