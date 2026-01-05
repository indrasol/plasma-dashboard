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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Integrations": true,
    "Overview": true,
    "Donors": true,
    "Influencers": true,
    "Campaigns": true,
    "Settings": true
  });
  
  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };
  
  const navigationSections: NavSection[] = [
    {
      title: "Integrations",
      roles: ["admin", "marketing", "super_admin"],
      items: [
        { 
          label: "CSV Upload", 
          link: "/integrations/csv", 
          roles: ["admin", "marketing", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          )
        },
        { 
          label: "Connect DB (BYOD)", 
          link: "/integrations/db", 
          roles: ["admin", "marketing", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          )
        },
        { 
          label: "CRM Sync", 
          link: "/integrations/crm", 
          roles: ["admin", "marketing", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Overview",
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
        }
      ]
    },
    {
      title: "Donors",
      roles: ["admin", "super_admin"],
      items: [
        { 
          label: "Donor Segments", 
          link: "/donors/segments", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          )
        },
        { 
          label: "Lookalike Analytics", 
          link: "/donors/lookalike", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          )
        },
        { 
          label: "Donor Elasticity", 
          link: "/donors/elasticity", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20"/>
              <path d="m17 5-5-3-5 3"/>
              <path d="m17 19-5 3-5-3"/>
            </svg>
          )
        },
        { 
          label: "Health Analysis", 
          link: "/donors/health", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Influencers",
      roles: ["admin", "super_admin"],
      items: [
        { 
          label: "Network Graph", 
          link: "/influencers/network", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          )
        },
        { 
          label: "Top Influencers", 
          link: "/influencers/list", 
          roles: ["admin", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <polyline points="16 11 18 13 22 9"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Campaigns",
      roles: ["admin", "marketing", "super_admin"],
      items: [
        { 
          label: "Conversion Analysis", 
          link: "/campaigns/conversion", 
          roles: ["admin", "marketing", "super_admin"],
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          )
        }
      ]
    },
    {
      title: "Settings",
      roles: ["admin", "super_admin"],
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
          label: "Manage Centers", 
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
              <div key={section.title} className={`nav-section ${!expandedSections[section.title] ? 'section-collapsed' : ''}`}>
                {!isCollapsed && (
                  <div 
                    className="nav-section-title" 
                    onClick={() => toggleSection(section.title)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>{section.title}</span>
                    <svg 
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                      style={{ 
                        transform: expandedSections[section.title] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        opacity: 0.5
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                )}
                <div className={`nav-section-items ${!expandedSections[section.title] ? 'items-hidden' : ''}`}>
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

        {/* AI Bottom Section */}
        <div className="sidebar-ai-section">
          {/* Live Signals Card */}
          <NavLink 
            to="/live-signals"
            className={({isActive}) => `ai-signals-btn ${isActive ? 'active' : ''}`}
            title={isCollapsed ? "Live AI Signals" : ""}
          >
            <div className="ai-btn-glow"></div>
            <div className="ai-btn-content">
              <span className="ai-btn-icon signals-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <span className="live-dot"></span>
              </span>
              {!isCollapsed && (
                <span className="ai-btn-text">
                  <span className="ai-btn-label">Live AI Signals</span>
                  <span className="ai-btn-sublabel">Neural Monitoring</span>
                </span>
              )}
            </div>
          </NavLink>

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

