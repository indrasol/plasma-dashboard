import React from 'react';

export default function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { label: "Dashboard", key: "dashboard" },
    { label: "Donors", key: "donors" },
    { label: "Influencers", key: "influencers" },
    { label: "Campaigns", key: "campaigns" },
  ];

  return (
    <nav style={{
      width: '200px',
      backgroundColor: '#1c5470',
      color: '#fff',
      paddingTop: '20px',
      height: '100vh'
    }}>
      <div style={{ paddingLeft:'20px', fontWeight:'bold', marginBottom:'1rem' }}>NuRam</div>

      {/* Render Menu Items */}
      {menuItems.map(item => (
        <SidebarLink
          key={item.key}
          label={item.label}
          isActive={activeView === item.key}
          onClick={() => setActiveView(item.key)}
        />
      ))}
    </nav>
  );
}

function SidebarLink({ label, isActive, onClick }) {
  const baseStyle = {
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    userSelect: 'none'
  };

  const activeStyle = isActive
    ? {
        backgroundColor: '#15405a',
        color: '#ffffff'
      }
    : {
        backgroundColor: 'transparent',
        color: '#cfd8dc'
      };

  return (
    <div
      style={{ ...baseStyle, ...activeStyle }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.target.style.color = 'orange';
        e.target.style.transform = 'translateY(1px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.color = isActive ? '#ffffff' : '#cfd8dc';
        e.target.style.transform = 'translateY(0)';
      }}
    >
      {label}
    </div>
  );
}